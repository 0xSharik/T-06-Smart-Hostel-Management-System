/**
 * src/modules/visitor/visitor.controller.js
 */

const visitorService = require("./visitor.service");
const visitorQRService = require("./visitor.qr");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getAllVisitors = async (req, res) => {
  const { page = 1, limit = 10, date, studentId } = req.query;
  const { visitors, total } = await visitorService.getAllVisitors({ page, limit, date, studentId });
  return sendPaginated(res, visitors, total, page, limit, "Visitors fetched successfully.");
};

const getVisitorsByStudent = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { visitors, total } = await visitorService.getVisitorsByStudent(req.params.studentId, { page, limit });
  return sendPaginated(res, visitors, total, page, limit, "Student visitor history fetched.");
};

const logVisitorEntry = async (req, res) => {
  const visitor = await visitorService.logVisitorEntry(req.body, req.user.id);
  return sendSuccess(res, visitor, "Visitor entry logged successfully.", 201);
};

const logVisitorExit = async (req, res) => {
  const visitor = await visitorService.logVisitorExit(req.params.id);
  return sendSuccess(res, visitor, "Visitor exit time recorded.");
};

const generateQR = async (req, res) => {
  const result = await visitorQRService.generateVisitorQR(req.body, req.user.id);
  return sendSuccess(res, result, "Visitor 8-hour QR Pass generated successfully.", 201);
};

const scanQR = async (req, res) => {
  const { qrToken } = req.body;
  const result = await visitorQRService.scanVisitorQR(qrToken, req.user.id);
  return sendSuccess(res, result, "Visitor QR Pass verified & entry logged successfully.");
};

module.exports = { getAllVisitors, getVisitorsByStudent, logVisitorEntry, logVisitorExit, generateQR, scanQR };
