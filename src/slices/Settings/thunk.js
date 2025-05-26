import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Include Both Helper File with needed methods
import {
    addNewBranch as addNewBranchApi,
    addNewMadrassa as addNewMadrassaApi,
    addNewRole as addNewRoleApi,
    addNewUser as addNewUserApi,
    deleteBranch as deleteBranchApi,
    deleteMadrassa as deleteMadrassaApi,
    deleteRole as deleteRoleApi,
    deleteUser as deleteUserApi,
    getBranches as getBranchesApi,
    getMadrassas as getMadrassasApi,
    getRoles as getRolesApi,
    getUsers as getUsersApi,
    updateBranch as updateBranchApi,
    updateMadrassa as updateMadrassaApi,
    updateRole as updateRoleApi,
    updateUser as updateUserApi
} from "../../helpers/backend_helper";

//    ====================== ROLE FUNTIONS =================
export const getRoles = createAsyncThunk("settings/getRoles", async () => {
    try {
        const response = await getRolesApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewRole = createAsyncThunk("settings/addNewRole", async (role,{ dispatch }) => {
    try {
        const response = await addNewRoleApi(role);
        toast.success("Role Created Successfully", { autoClose: 3000 });
        dispatch(getRoles());

        return response;
    } catch (error) {
        toast.error("Role Create Failed", { autoClose: 3000 });
        return error;
    }
});

export const updateRole = createAsyncThunk("settings/updateRole", async (role,{dispatch}) => {
    try {
        const response = await updateRoleApi(role);
        toast.success("Role Updated Successfully", { autoClose: 3000 });
        dispatch(getRoles());
        return response;
    } catch (error) {
        toast.error("Role Updated Failed", { autoClose: 3000 });
        return error;
    }
});

export const deleteRole = createAsyncThunk("settings/deleteRole", async (role,{dispatch}) => {
    try {
        const response = await deleteRoleApi(role);
        toast.success("Role Deleted Successfully", { autoClose: 3000 });
        dispatch(getRoles());
        return { role, ...response };
    } catch (error) {
        toast.error("Role Deleted Failed", { autoClose: 3000 });
        return error;
    }

});
//    ====================== END ROLE FUNTIONS =================


//    ====================== BEGIN USERS FUNTIONS =================
export const getUsers = createAsyncThunk("settings/getUsers", async () => {
    try {
        const response = await getUsersApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewUser = createAsyncThunk("settings/addNewUser", async (user, { dispatch }) => {
    try {
        const response = await addNewUserApi(user);
        toast.success("User Created Successfully", { autoClose: 3000 });
        dispatch(getUsers());
        return response;
    } catch (error) {
        toast.error("User Create Failed", { autoClose: 3000 });
        return error;
    }
});

export const updateUser = createAsyncThunk("settings/updateUser", async (user, { dispatch }) => {
    try {
        const response = await updateUserApi(user);
        toast.success("User Updated Successfully", { autoClose: 3000 });
        dispatch(getUsers());
        return response;
    } catch (error) {
        toast.error("User Update Failed", { autoClose: 3000 });
        return error;
    }
});

export const deleteUser = createAsyncThunk("settings/deleteUser", async (userId, { dispatch }) => {
    try {
        const response = await deleteUserApi(userId);
        toast.success("User Deleted Successfully", { autoClose: 3000 });
        dispatch(getUsers());
        return { userId, ...response };
    } catch (error) {
        toast.error("User Delete Failed", { autoClose: 3000 });
        return error;
    }
});

//    ====================== END USERS FUNTIONS =================



//    ====================== BEGIN BRANCHES FUNTIONS =================

export const getBranches = createAsyncThunk("settings/getBranches", async () => {
    try {
        const response = await getBranchesApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewBranch = createAsyncThunk("settings/addNewBranch", async (branch, { dispatch }) => {
    try {
        const response = await addNewBranchApi(branch);
        toast.success("Branch Created Successfully", { autoClose: 3000 });
        dispatch(getBranches());
        return response;
    } catch (error) {
        toast.error("Branch Create Failed", { autoClose: 3000 });
        return error;
    }
});

export const updateBranch = createAsyncThunk("settings/updateBranch", async (branch, { dispatch }) => {
    try {
        const response = await updateBranchApi(branch);
        toast.success("Branch Updated Successfully", { autoClose: 3000 });
        dispatch(getBranches());
        return response;
    } catch (error) {
        toast.error("Branch Update Failed", { autoClose: 3000 });
        return error;
    }
});

export const deleteBranch = createAsyncThunk("settings/deleteBranch", async (branchId, { dispatch }) => {
    try {
        const response = await deleteBranchApi(branchId);
        toast.success("Branch Deleted Successfully", { autoClose: 3000 });
        dispatch(getBranches());
        return { branchId, ...response };
    } catch (error) {
        toast.error("Branch Delete Failed", { autoClose: 3000 });
        return error;
    }
});


//    ====================== END BRANCHES FUNTIONS =================


//    ====================== BEGIN MADRASSA FUNTIONS =================

export const getMadrassas = createAsyncThunk("settings/getMadrassas", async () => {
    try {
        const response = await getMadrassasApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewMadrassa = createAsyncThunk("settings/addNewMadrassa", async (madrassa, { dispatch }) => {
    try {
        const response = await addNewMadrassaApi(madrassa);
        toast.success("Madrassa Created Successfully", { autoClose: 3000 });
        dispatch(getMadrassas());
        return response;
    } catch (error) {
        toast.error("Madrassa Create Failed", { autoClose: 3000 });
        return error;
    }
});

export const updateMadrassa = createAsyncThunk("settings/updateMadrassa", async (madrassa, { dispatch }) => {
    try {
        const response = await updateMadrassaApi(madrassa);
        toast.success("Madrassa Updated Successfully", { autoClose: 3000 });
        dispatch(getMadrassas());
        return response;
    } catch (error) {
        toast.error("Madrassa Update Failed", { autoClose: 3000 });
        return error;
    }
});

export const deleteMadrassa = createAsyncThunk("settings/deleteMadrassa", async (madrassaId, { dispatch }) => {
    try {
        const response = await deleteMadrassaApi(madrassaId);
        toast.success("Madrassa Deleted Successfully", { autoClose: 3000 });
        dispatch(getMadrassas());
        return { madrassaId, ...response };
    } catch (error) {
        toast.error("Madrassa Delete Failed", { autoClose: 3000 });
        return error;
    }
});


//    ====================== END MADRASSA FUNTIONS =================
