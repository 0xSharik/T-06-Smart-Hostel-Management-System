/**
 * src/modules/dashboard/dashboard.controller.js
 */

const dashboardService = require("./dashboard.service");
const { sendSuccess } = require("../../utils/response");

const getStats = async (req, res) => {
  const stats = await dashboardService.getStats();
  return sendSuccess(res, stats, "Dashboard stats fetched.");
};

const getOccupancyByFloor = async (req, res) => {
  const data = await dashboardService.getOccupancyByFloor();
  return sendSuccess(res, data, "Occupancy by floor fetched.");
};

const getMaintenanceByStatus = async (req, res) => {
  const data = await dashboardService.getMaintenanceByStatus();
  return sendSuccess(res, data, "Maintenance by status fetched.");
};

module.exports = { getStats, getOccupancyByFloor, getMaintenanceByStatus };
