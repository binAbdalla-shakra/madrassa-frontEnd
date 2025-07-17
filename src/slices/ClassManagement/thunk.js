import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  addNewGroup as addGroupApi,
  addStudentsToGroup as addStudentsToGroupApi,
  deleteGroup as deleteGroupApi,
  getGroups as getAllGroupsApi,
  getGroupStudents as getGroupStudentsApi,
  getUnGroupedStudents as getUnGroupedStudentsApi,
  removeStudentFromGroup as removeStudentFromGroupApi,
  updateGroup as updateGroupApi
} from "../../helpers/backend_helper";


import handleApiResponse from "../utils.js/toasterHelper ";

// ====================== GROUP FUNCTIONS ======================

// Get all groups
export const getAllGroups = createAsyncThunk("classManagement/getAllGroups", async () => {
  try {
    const response = await getAllGroupsApi();
    return response;
  } catch (error) {
    return error;
  }
});

// Add new group
export const addGroup = createAsyncThunk(
  "classManagement/addGroup",
  async (group, { dispatch }) => {
    try {
      const response = await addGroupApi(group);
      handleApiResponse(response, "Group created successfully", "Failed to create group");
      if (response.success) dispatch(getAllGroups());
      return response;
    } catch (error) {
      const message =
        error?.message || error?.response?.data?.message || "Failed to create group";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

// Update group
export const updateGroup = createAsyncThunk(
  "classManagement/updateGroup",
  async (group, { dispatch }) => {
    try {
      const response = await updateGroupApi(group);
      handleApiResponse(response, "Group updated successfully", "Failed to update group");
      if (response.success) dispatch(getAllGroups());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

// Delete group
export const deleteGroup = createAsyncThunk(
  "classManagement/deleteGroup",
  async (groupId, { dispatch }) => {
    try {
      const response = await deleteGroupApi(groupId);
      handleApiResponse(response, "Group deleted successfully", "Failed to delete group");
      if (response.success) dispatch(getAllGroups());
      return { groupId, ...response };
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

// Get students in a group
export const getGroupStudents = createAsyncThunk(
  "classManagement/getGroupStudents",
  async ( payload) => {
    try {
      const response = await getGroupStudentsApi(payload);
      return response;
    } catch (error) {
      return error;
    }
  }
);

// Add students to a group
export const addStudentsToGroup = createAsyncThunk(
  "classManagement/addStudentsToGroup",
  async ({ groupId, studentIds,madrassaId }, { dispatch }) => {
    try {
      const response = await addStudentsToGroupApi({ groupId, studentIds,madrassaId });
      handleApiResponse(response, "Students added successfully", "Failed to add students");
      if (response.success) {
        dispatch(getGroupStudents({ groupId, madrassaId: madrassaId }));
        dispatch(getUnGroupedStudents());
        dispatch(getAllGroups());

      }

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

// Remove a student from a group
export const removeStudentFromGroup = createAsyncThunk(
  "classManagement/removeStudentFromGroup",
  async ({ groupId, studentId,DeletedBy,madrassaId }, { dispatch }) => {
    try {
      const response = await removeStudentFromGroupApi({ groupId, studentId,DeletedBy,madrassaId });
      handleApiResponse(response, "Student removed successfully", "Failed to remove student");
      if (response.success) {
       dispatch(getGroupStudents({ groupId, madrassaId: madrassaId }));
       dispatch(getUnGroupedStudents());
       dispatch(getAllGroups());

        }
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);


export const getUnGroupedStudents = createAsyncThunk("classManagement/getUnGroupedStudents", async () => {
  try {
    const response = await getUnGroupedStudentsApi();
    return response;
  } catch (error) {
    return error;
  }
});