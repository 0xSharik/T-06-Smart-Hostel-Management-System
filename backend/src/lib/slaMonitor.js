/**
 * src/lib/slaMonitor.js — SLA Breach Monitor Service
 *
 * Scans for maintenance requests unresolved after 48 hours.
 * Automatically broadcasts ALERT notifications to Wardens & Admins.
 */

const prisma = require("./prisma");
const logger = require("./logger");

const SLA_HOURS = parseInt(process.env.SLA_THRESHOLD_HOURS || "48", 10);

const checkSLABreaches = async () => {
  try {
    const thresholdDate = new Date(Date.now() - SLA_HOURS * 60 * 60 * 1000);

    // Find pending/in-progress requests older than SLA_HOURS
    const breachedRequests = await prisma.maintenanceRequest.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        createdAt: { lte: thresholdDate },
      },
      include: {
        user: { select: { name: true } },
        room: { select: { roomNo: true } },
      },
    });

    if (breachedRequests.length === 0) {
      return { breachedCount: 0 };
    }

    logger.warn(`[SLA Monitor] Found ${breachedRequests.length} maintenance tickets breaching ${SLA_HOURS}h SLA.`);

    // Find all Warden and Admin users to notify
    const wardensAndAdmins = await prisma.user.findMany({
      where: { role: { in: ["WARDEN", "ADMIN"] } },
      select: { id: true },
    });

    // Create notifications
    for (const req of breachedRequests) {
      const hoursOverdue = Math.floor((Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60));
      const title = `🚨 SLA Breach: Room ${req.room?.roomNo || "N/A"} (${hoursOverdue}h Overdue)`;
      const message = `Maintenance ticket "${req.title}" by ${req.user?.name} has remained unresolved for ${hoursOverdue} hours. Priority: ${req.priority}.`;

      for (const recipient of wardensAndAdmins) {
        // Prevent duplicate alerts for the same ticket if unread alert exists
        const existingAlert = await prisma.notification.findFirst({
          where: {
            userId: recipient.id,
            title,
            isRead: false,
          },
        });

        if (!existingAlert) {
          await prisma.notification.create({
            data: {
              title,
              message,
              type: "ALERT",
              userId: recipient.id,
            },
          });
        }
      }
    }

    return { breachedCount: breachedRequests.length };
  } catch (error) {
    logger.error("[SLA Monitor] Error checking SLA breaches:", error);
    return { error: error.message };
  }
};

/**
 * Start recurring background SLA monitor timer (runs every hour)
 */
const startSLAMonitor = (intervalMs = 60 * 60 * 1000) => {
  logger.info(`[SLA Monitor] Background job initialized. Threshold: ${SLA_HOURS}h.`);
  // Run initial check on server boot after 5 seconds delay
  setTimeout(checkSLABreaches, 5000);
  // Schedule recurring check
  setInterval(checkSLABreaches, intervalMs);
};

module.exports = { checkSLABreaches, startSLAMonitor };
