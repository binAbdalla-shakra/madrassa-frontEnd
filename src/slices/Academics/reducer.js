import { createSlice } from "@reduxjs/toolkit";
import {
  getParents,
  getStudents,
  getTeachers,
} from "./thunk"; // Make sure you define these in thunk.js

export const initialState = {
  parents: [],
  students: [],
  teachers: [],

  isParentSuccess: false,
  isStudentSuccess: false,
  isTeacherSuccess: false,

  error: null,
};

const AcademicsSlice = createSlice({
  name: "AcademicsSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ========================= PARENTS ============================
    builder.addCase(getParents.fulfilled, (state, action) => {
      state.parents = action.payload.data;
      state.isParentSuccess = true;
    });
    builder.addCase(getParents.rejected, (state, action) => {
      state.error = action.error.message;
      state.isParentSuccess = false;
    });

    // ========================= STUDENTS ============================
    builder.addCase(getStudents.fulfilled, (state, action) => {
      state.students = action.payload.data;
      state.isStudentSuccess = true;
    });
    builder.addCase(getStudents.rejected, (state, action) => {
      state.error = action.error.message;
      state.isStudentSuccess = false;
    });

    // ========================= TEACHERS ============================
    builder.addCase(getTeachers.fulfilled, (state, action) => {
      state.teachers = action.payload.data;
      state.isTeacherSuccess = true;
    });
    builder.addCase(getTeachers.rejected, (state, action) => {
      state.error = action.error.message;
      state.isTeacherSuccess = false;
    });
  },
});

export default AcademicsSlice.reducer;
