/**
 * src/modules/maintenance/maintenance.controller.js
 */

const maintenanceService = require("./maintenance.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getAllRequests = async (req, res) => {
  const { page = 1, limit = 10, status, priority, category } = req.query;
  const { requests, total } = await maintenanceService.getAllRequests({
    page, limit, status, priority, category,
    userId: req.user.id,
    role: req.user.role,
  });
  return sendPaginated(res, requests, total, page, limit, "Maintenance requests fetched.");
};

const getRequestById = async (req, res) => {
  const request = await maintenanceService.getRequestById(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, request, "Maintenance request fetched.");
};

const createRequest = async (req, res) => {
  const request = await maintenanceService.createRequest(req.body, req.user.id);
  return sendSuccess(res, request, "Maintenance request submitted successfully.", 201);
};

const updateRequest = async (req, res) => {
  const request = await maintenanceService.updateRequest(req.params.id, req.body, req.user.id, req.user.role);
  return sendSuccess(res, request, "Maintenance request updated.");
};

const updateStatus = async (req, res) => {
  const request = await maintenanceService.updateStatus(req.params.id, req.body);
  return sendSuccess(res, request, "Status updated successfully.");
};

const deleteRequest = async (req, res) => {
  await maintenanceService.deleteRequest(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, null, "Maintenance request deleted.");
};

const getStats = async (req, res) => {
  const stats = await maintenanceService.getStats();
  return sendSuccess(res, stats, "Maintenance stats fetched.");
};

module.exports = { getAllRequests, getRequestById, createRequest, updateRequest, updateStatus, deleteRequest, getStats };
