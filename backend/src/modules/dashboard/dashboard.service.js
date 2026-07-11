/**
 * src/modules/dashboard/dashboard.service.js — Dashboard Aggregate Stats
 *
 * Fetches summary data from multiple modules in parallel using Promise.all.
 * This is the ONLY module that intentionally reads from multiple tables —
 * it is a read-only aggregation module, not a write module.
 */

const prisma = require("../../lib/prisma");

const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalRooms,
    roomStats,
    pendingMaintenance,
    urgentMaintenance,
    todayVisitors,
    upcomingHolidays,
    unreadNotifications,
    totalUsers,
    recentStudents,
    recentMaintenance,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.room.count(),
    prisma.room.aggregate({ _sum: { capacity: true, occupancy: true } }),
    prisma.maintenanceRequest.count({ where: { status: "PENDING" } }),
    prisma.maintenanceRequest.count({ where: { status: "PENDING", priority: "URGENT" } }),
    prisma.visitor.count({ where: { inTime: { gte: today } } }),
    prisma.holiday.count({ where: { date: { gte: new Date() } } }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.user.count(),
    prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rollNo: true,
        course: true,
        admissionDate: true,
        user: { select: { name: true, email: true } },
        room: { select: { roomNo: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true,
        user: { select: { name: true } },
        room: { select: { roomNo: true } },
      },
    }),
  ]);

  const totalCapacity = roomStats._sum.capacity || 0;
  const totalOccupancy = roomStats._sum.occupancy || 0;

  return {
    overview: {
      totalStudents,
      totalRooms,
      totalUsers,
      totalCapacity,
      totalOccupancy,
      occupancyRate: totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0,
      availableSeats: totalCapacity - totalOccupancy,
    },
    maintenance: {
      pending: pendingMaintenance,
      urgent: urgentMaintenance,
    },
    visitors: {
      today: todayVisitors,
    },
    holidays: {
      upcoming: upcomingHolidays,
    },
    notifications: {
      unread: unreadNotifications,
    },
    recent: {
      students: recentStudents,
      maintenance: recentMaintenance,
    },
  };
};

/**
 * Get chart-ready data for room occupancy by floor
 */
const getOccupancyByFloor = async () => {
  const rooms = await prisma.room.groupBy({
    by: ["floor"],
    _sum: { capacity: true, occupancy: true },
    orderBy: { floor: "asc" },
  });

  return rooms.map((r) => ({
    floor: `Floor ${r.floor}`,
    capacity: r._sum.capacity,
    occupied: r._sum.occupancy,
    available: r._sum.capacity - r._sum.occupancy,
  }));
};

/**
 * Get maintenance requests count grouped by status (for pie chart)
 */
const getMaintenanceByStatus = async () => {
  const result = await prisma.maintenanceRequest.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  return result.map((r) => ({ status: r.status, count: r._count.status }));
};

module.exports = { getStats, getOccupancyByFloor, getMaintenanceByStatus };
