/**
 * src/modules/holiday/holiday.controller.js
 */

const holidayService = require("./holiday.service");
const { sendSuccess } = require("../../utils/response");

const getAllHolidays = async (req, res) => {
  const { year, type } = req.query;
  const holidays = await holidayService.getAllHolidays({ year, type });
  return sendSuccess(res, holidays, "Holidays fetched.");
};

const getUpcomingHolidays = async (req, res) => {
  const { limit = 5 } = req.query;
  const holidays = await holidayService.getUpcomingHolidays(limit);
  return sendSuccess(res, holidays, "Upcoming holidays fetched.");
};

const getHolidayById = async (req, res) => {
  const holiday = await holidayService.getHolidayById(req.params.id);
  return sendSuccess(res, holiday, "Holiday fetched.");
};

const createHoliday = async (req, res) => {
  const holiday = await holidayService.createHoliday(req.body);
  return sendSuccess(res, holiday, "Holiday created.", 201);
};

const updateHoliday = async (req, res) => {
  const holiday = await holidayService.updateHoliday(req.params.id, req.body);
  return sendSuccess(res, holiday, "Holiday updated.");
};

const deleteHoliday = async (req, res) => {
  await holidayService.deleteHoliday(req.params.id);
  return sendSuccess(res, null, "Holiday deleted.");
};

module.exports = { getAllHolidays, getUpcomingHolidays, getHolidayById, createHoliday, updateHoliday, deleteHoliday };
