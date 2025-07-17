import { createSlice } from "@reduxjs/toolkit";
import {
  getAllGroups,
  getGroupStudents,
  getUnGroupedStudents,
} from "./thunk"; // Make sure you define these in thunk.js

export const initialState = {
  groups: [],
  groupStudents:[],
  unGroupedStudents:[],

  isGroupStudentSuccess:false,
  isUnGroupedStudentsSucces:false,
  isGroupSuccess: false,
  error: null,
};

const ClassManagementsSlice = createSlice({
  name: "ClassManagementsSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ========================= GROUPS ============================
    builder.addCase(getAllGroups.fulfilled, (state, action) => {
      state.groups = action.payload.data;
      state.isGroupSuccess = true;
    });
    // builder.addCase(getAllGroups.rejected, (state, action) => {
    //   state.error = action.error.message;
    //   state.isGroupSuccess = false;
    // });


      builder.addCase(getGroupStudents.fulfilled, (state, action) => {
      state.groupStudents = action.payload.data;
      state.isGroupStudentSuccess = true;
    });
    // builder.addCase(getGroupStudents.rejected, (state, action) => {
    //   state.error = action.error.message;
    //   state.isGroupSuccess = false;
    // });

     builder.addCase(getUnGroupedStudents.fulfilled, (state, action) => {
      state.unGroupedStudents = action.payload.data;
      state.isUnGroupedStudentsSucces = true;
    });
    
  },
});

export default ClassManagementsSlice.reducer;
