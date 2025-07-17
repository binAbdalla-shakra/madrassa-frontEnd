import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  addNewParent as addNewParentApi,
  addNewStudent as addNewStudentApi,
  addNewTeacher as addNewTeacherApi,
  deleteParent as deleteParentApi,
  deleteStudent as deleteStudentApi,
  deleteTeacher as deleteTeacherApi,
  getParents as getParentsApi,
  getStudents as getStudentsApi,
  getTeachers as getTeachersApi,
  updateParent as updateParentApi,
  updateStudent as updateStudentApi,
  updateTeacher as updateTeacherApi,
} from "../../helpers/backend_helper";
import handleApiResponse from "../utils.js/toasterHelper ";


// ====================== PARENT FUNCTIONS ======================
export const getParents = createAsyncThunk("academics/getParents", async () => {
  try {
    const response = await getParentsApi();
    return response;
  } catch (error) {
    return error;
  }
});

export const addNewParent = createAsyncThunk(
  "academics/addNewParent",
  async (parent, { dispatch }) => {
    try {
      const response = await addNewParentApi(parent);

      handleApiResponse(
        response,
        "Parent created successfully",
        "Failed to create parent"
      );

      if (response.success) {
        dispatch(getParents());
      }

      return response;
    } catch (error) {
      console.log(error);
      const message =
        error?.message || error?.response?.data?.message || "Failed to Create Parent";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

export const updateParent = createAsyncThunk(
  "academics/updateParent",
  async (parent, { dispatch }) => {
    try {
      const response = await updateParentApi(parent);

      handleApiResponse(
        response,
        "Parent updated successfully",
        "Failed to update parent"
      );

      if (response.success) dispatch(getParents());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, error: message };
    }
  }
);


export const deleteParent = createAsyncThunk(
  "academics/deleteParent",
  async (parentId, { dispatch }) => {
    try {
      const response = await deleteParentApi(parentId);
      handleApiResponse(
        response,
        "Parent deleted successfully",
        "Failed to delete parent"
      );
      if (response.success) dispatch(getParents());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, error: message };
    }
  }
);


// ====================== STUDENT FUNCTIONS ======================
export const getStudents = createAsyncThunk("academics/getStudents", async () => {
  try {
    const response = await getStudentsApi();
    return response;
  } catch (error) {
    return error;
  }
});
export const addNewStudent = createAsyncThunk(
  "academics/addNewStudent",
  async (student, { dispatch }) => {
    try {
      const response = await addNewStudentApi(student);
      handleApiResponse(response, "Student created successfully", "Failed to create student");
      if (response.success) dispatch(getStudents());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

export const updateStudent = createAsyncThunk(
  "academics/updateStudent",
  async (student, { dispatch }) => {
    try {
      const response = await updateStudentApi(student);
      handleApiResponse(response, "Student updated successfully", "Failed to update student");
      if (response.success) dispatch(getStudents());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "academics/deleteStudent",
  async (studentId, { dispatch }) => {
    try {
      const response = await deleteStudentApi(studentId);
      handleApiResponse(response, "Student deleted successfully", "Failed to delete student");
      if (response.success) dispatch(getStudents());
      return { studentId, ...response };
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

// ====================== TEACHER FUNCTIONS ======================
export const getTeachers = createAsyncThunk("academics/getTeachers", async () => {
  try {
    const response = await getTeachersApi();
    return response;
  } catch (error) {
    return error;
  }
});
export const addNewTeacher = createAsyncThunk(
  "academics/addNewTeacher",
  async (teacher, { dispatch }) => {
    try {
      const response = await addNewTeacherApi(teacher);
      handleApiResponse(response, "Teacher Created Successfully", "Failed to create teacher");
      if (response.success) dispatch(getTeachers());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "academics/updateTeacher",
  async (teacher, { dispatch }) => {
    try {
      const response = await updateTeacherApi(teacher);
      handleApiResponse(response, "Teacher Updated Successfully", "Failed to update teacher");
      if (response.success) dispatch(getTeachers());
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "academics/deleteTeacher",
  async (teacherId, { dispatch }) => {
    try {
      const response = await deleteTeacherApi(teacherId);
      handleApiResponse(response, "Teacher Deleted Successfully", "Failed to delete teacher");
      if (response.success) dispatch(getTeachers());
      return { teacherId, ...response };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unexpected error occurred";
      toast.error(message, { autoClose: 3000 });
      return { success: false, message };
    }
  }
);