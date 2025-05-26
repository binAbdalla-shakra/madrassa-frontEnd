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
export const postFakeLogin = data => api.create(url.POST_LOGIN, data);

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
