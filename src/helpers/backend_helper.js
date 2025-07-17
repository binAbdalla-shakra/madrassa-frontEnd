import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

// //is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};


// Login Method
export const postLogin = data => api.create(url.POST_LOGIN, data);

// ============================== SETTINGS =========================
//ROlES
export const addNewRole = role => api.create(url.ADD_NEW_ROLE, role);
export const updateRole = role => api.put(url.UPDATE_ROLE + '/' + role._id, role);
export const deleteRole = role => api.delete(url.DELETE_ROLE + '/' + role);
export const getRoles = () => api.get(url.GET_ROLES);


// USERS
export const addNewUser = (user) => api.create(url.ADD_NEW_USER, user);
export const updateUser = (user) => api.put(url.UPDATE_USER + '/' + user._id, user);
export const deleteUser = (userId) => api.delete(url.DELETE_USER + '/' + userId);
export const getUsers = () => api.get(url.GET_USERS);

// BRANCHES
export const addNewBranch = (branch) => api.create(url.ADD_NEW_BRANCH, branch);
export const updateBranch = (branch) => api.put(url.UPDATE_BRANCH + '/' + branch._id, branch);
export const deleteBranch = (branchId) => api.delete(url.DELETE_BRANCH + '/' + branchId);
export const getBranches = () => api.get(url.GET_BRANCHES);

// MADRASSAS
export const addNewMadrassa = (madrassa) => api.create(url.ADD_NEW_MADRASSA, madrassa);
export const updateMadrassa = (madrassa) => api.put(url.UPDATE_MADRASSA + '/' + madrassa._id, madrassa);
export const deleteMadrassa = (madrassaId) => api.delete(url.DELETE_MADRASSA + '/' + madrassaId);
export const getMadrassas = () => api.get(url.GET_MADRASSAS);

// ============================== END OF SETTINGS =========================


// ============================== StART OF ACADEMICS =========================


export const addNewParent = (parent) => api.create(url.ADD_NEW_PARENT, parent);
export const updateParent = (parent) => api.put(url.UPDATE_PARENT + '/' + parent._id, parent);
export const deleteParent = (parentId) => api.delete(url.DELETE_PARENT + '/' + parentId);
export const getParents = () => api.get(url.GET_PARENTS);


export const addNewStudent = (student) => api.create(url.ADD_NEW_STUDENT, student);
export const updateStudent = (student) => api.put(url.UPDATE_STUDENT + '/' + student._id, student);
export const deleteStudent = (studentId) => api.delete(url.DELETE_STUDENT + '/' + studentId);
export const getStudents = () => api.get(url.GET_STUDENTS);



export const addNewTeacher = (teacher) => api.create(url.ADD_NEW_TEACHER, teacher);
export const updateTeacher = (teacher) => api.put(url.UPDATE_TEACHER + '/' + teacher._id, teacher);
export const deleteTeacher = (teacherId) => api.delete(url.DELETE_TEACHER + '/' + teacherId);
export const getTeachers = () => api.get(url.GET_TEACHERS);

// ============================== END OF ACAdEMICS =========================

export const addNewGroup = (group) => api.create(url.ADD_NEW_GROUP, group);
export const updateGroup = (group) => api.put(`${url.UPDATE_GROUP}/${group._id}`, group);
export const deleteGroup = (groupId) => api.delete(url.DELETE_GROUP + '/' + groupId);
export const getGroups = () => api.get(url.GET_GROUPS);
export const getGroupStudents = (params) => api.get(url.GET_GROUP_STUDENTS, params);
export const addStudentsToGroup = (payload) => api.create(url.ADD_STUDENTS_TO_GROUP, payload);
export const removeStudentFromGroup = (payload) => api.create(url.REMOVE_STUDENT_FROM_GROUP, payload);
export const getUnGroupedStudents = () => api.get(url.GET_UNGROUPED_STUDENTS);

