const userService = require("./user.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const listUsers = async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendPaginated(res, result.users, result.total, result.page, result.limit, "Users fetched successfully.");
};

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, user, "User account created successfully.", 201);
};

module.exports = { listUsers, createUser };
