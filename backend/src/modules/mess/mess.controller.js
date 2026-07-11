/**
 * src/modules/mess/mess.controller.js
 */

const messService = require("./mess.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getWeeklyMenu = async (req, res) => {
  const menu = await messService.getWeeklyMenu();
  return sendSuccess(res, menu, "Weekly mess menu fetched.");
};

const getMenuById = async (req, res) => {
  const menu = await messService.getMenuById(req.params.id);
  return sendSuccess(res, menu, "Menu item fetched.");
};

const createMenuItem = async (req, res) => {
  const item = await messService.createMenuItem(req.body);
  return sendSuccess(res, item, "Menu item created.", 201);
};

const updateMenuItem = async (req, res) => {
  const item = await messService.updateMenuItem(req.params.id, req.body);
  return sendSuccess(res, item, "Menu item updated.");
};

const deleteMenuItem = async (req, res) => {
  await messService.deleteMenuItem(req.params.id);
  return sendSuccess(res, null, "Menu item deleted.");
};

const submitFeedback = async (req, res) => {
  const feedback = await messService.submitFeedback(req.body, req.user.id);
  return sendSuccess(res, feedback, "Feedback submitted.", 201);
};

const getFeedbacks = async (req, res) => {
  const { page = 1, limit = 10, messMenuId } = req.query;
  const { feedbacks, total, averageRating } = await messService.getFeedbacks({ page, limit, messMenuId });
  return sendPaginated(res, { feedbacks, averageRating }, total, page, limit, "Feedbacks fetched.");
};

module.exports = { getWeeklyMenu, getMenuById, createMenuItem, updateMenuItem, deleteMenuItem, submitFeedback, getFeedbacks };
