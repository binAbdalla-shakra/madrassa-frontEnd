import { createSlice } from "@reduxjs/toolkit";
import {
  getBranches,
  getMadrassas,
  getRoles,
  getUsers
} from './thunk';

export const initialState = {
  roles: [],
  users: [],
  branches: [],
  madrassas: [],

  isRoleSuccess: false,
  isUserSuccess: false,
  isBranchSuccess: false,
  isMadrassaSuccess: false,

  error: null,
};

const SettingsSlice = createSlice({
  name: 'SettingsSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ========================= ROLES ============================
    builder.addCase(getRoles.fulfilled, (state, action) => {
      state.roles = action.payload.data;
      state.isRoleSuccess = true;
    });
    builder.addCase(getRoles.rejected, (state, action) => {
      state.error = action.error.message;
      state.isRoleSuccess = false;
    });

    // ========================= USERS ============================
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.users = action.payload.data;
      state.isUserSuccess = true;
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.error = action.error.message;
      state.isUserSuccess = false;
    });

    // ========================= BRANCHES ============================
    builder.addCase(getBranches.fulfilled, (state, action) => {
      state.branches = action.payload.data;
      state.isBranchSuccess = true;
    });
    builder.addCase(getBranches.rejected, (state, action) => {
      state.error = action.error.message;
      state.isBranchSuccess = false;
    });

    // ========================= MADRASSAS ============================
    builder.addCase(getMadrassas.fulfilled, (state, action) => {
      state.madrassas = action.payload.data;
      state.isMadrassaSuccess = true;
    });
    builder.addCase(getMadrassas.rejected, (state, action) => {
      state.error = action.error.message;
      state.isMadrassaSuccess = false;
    });

    // Optionally add handling for add/update/delete success/fail states if needed
  }
});

export default SettingsSlice.reducer;
