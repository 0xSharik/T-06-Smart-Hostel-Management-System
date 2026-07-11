/**
 * src/modules/student/student.controller.js — Student Controller
 */

const studentService = require("./student.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getAllStudents = async (req, res) => {
  const { page = 1, limit = 10, search = "", course = "", year = "" } = req.query;
  const { students, total } = await studentService.getAllStudents({ page, limit, search, course, year });
  return sendPaginated(res, students, total, page, limit, "Students fetched successfully.");
};

const getStudentById = async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  return sendSuccess(res, student, "Student fetched successfully.");
};

const createStudent = async (req, res) => {
  const student = await studentService.createStudent(req.body);
  return sendSuccess(res, student, "Student profile created successfully.", 201);
};

const updateStudent = async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  return sendSuccess(res, student, "Student profile updated successfully.");
};

const deleteStudent = async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  return sendSuccess(res, null, "Student profile deleted successfully.");
};

const assignRoom = async (req, res) => {
  const student = await studentService.assignRoom(req.params.id, req.body.roomId);
  return sendSuccess(res, student, "Room assigned successfully.");
};

const unassignRoom = async (req, res) => {
  const student = await studentService.unassignRoom(req.params.id);
  return sendSuccess(res, student, "Room unassigned successfully.");
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, assignRoom, unassignRoom };
