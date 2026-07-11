/**
 * src/modules/visitor/visitor.controller.js
 */

const visitorService = require("./visitor.service");
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

module.exports = { getAllVisitors, getVisitorsByStudent, logVisitorEntry, logVisitorExit };
