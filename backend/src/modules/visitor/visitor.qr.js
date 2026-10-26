/**
 * src/modules/visitor/visitor.qr.js — Visitor QR Pass Generation & Verification
 */

const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");
const { JWT_SECRET } = require("../../config/env");

/**
 * Generate a signed 8-hour QR Pass token and image data URL
 */
const generateVisitorQR = async ({ studentId, name, phone, relation, purpose }, loggedById) => {
  const student = await prisma.student.findFirst({
    where: { OR: [{ id: studentId }, { rollNo: studentId }] },
    include: { user: { select: { name: true } }, room: { select: { roomNo: true } } },
  });
  if (!student) throw new AppError("Student profile not found.", 404);

  // 8-hour expiration
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  // Signed payload
  const tokenPayload = {
    type: "VISITOR_PASS",
    studentId: student.id,
    visitorName: name,
    phone,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const qrToken = jwt.sign(tokenPayload, JWT_SECRET);

  // Generate QR Code image PNG Data URL
  let qrImageDataUrl;
  try {
    qrImageDataUrl = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: "H",
      margin: 2,
      color: { dark: "#0f1117", light: "#ffffff" },
    });
  } catch (qrErr) {
    throw new AppError("Failed to generate QR code image. Please try again.", 500);
  }

  // Save pre-authorized visitor pass record
  let visitorRecord;
  try {
    visitorRecord = await prisma.visitor.create({
      data: {
        studentId: student.id,
        name,
        phone,
        relation,
        purpose: purpose || "QR Pass",
        qrToken,
        expiresAt,
        inTime: null,
        loggedById,
      },
      include: {
        student: { select: { rollNo: true, user: { select: { name: true } }, room: { select: { roomNo: true } } } },
      },
    });
  } catch (dbErr) {
    throw new AppError("Failed to save visitor pass to database. Please check your connection and try again.", 500);
  }

  return {
    visitorRecord,
    qrToken,
    qrImageDataUrl,
    expiresAt,
  };
};

/**
 * Scan & Verify QR token at hostel entry gate
 */
const scanVisitorQR = async (qrToken, guardUserId) => {
  let decoded;
  try {
    decoded = jwt.verify(qrToken, JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired QR visitor pass token.", 400);
  }

  if (decoded.type !== "VISITOR_PASS") {
    throw new AppError("Malformed token type.", 400);
  }

  const existing = await prisma.visitor.findUnique({
    where: { qrToken },
    include: { student: { select: { rollNo: true, user: { select: { name: true } }, room: { select: { roomNo: true } } } } },
  });

  if (!existing) {
    throw new AppError("Visitor pass record not found.", 404);
  }

  if (existing.inTime) {
    throw new AppError("This QR pass has already been scanned for entry.", 400);
  }

  if (existing.outTime) {
    throw new AppError("This QR pass has already been closed.", 400);
  }

  // Update inTime / loggedBy if not already logged
  const claimed = await prisma.visitor.updateMany({
    where: { id: existing.id, inTime: null, outTime: null, expiresAt: { gt: new Date() } },
    data: { inTime: new Date(), loggedById: guardUserId || existing.loggedById },
  });
  if (!claimed.count) throw new AppError("This QR pass has expired or was already scanned.", 400);
  const updatedVisitor = await prisma.visitor.findUnique({
    where: { id: existing.id },
    include: { student: { select: { rollNo: true, user: { select: { name: true } }, room: { select: { roomNo: true } } } } },
  });

  return updatedVisitor;
};

module.exports = { generateVisitorQR, scanVisitorQR };
