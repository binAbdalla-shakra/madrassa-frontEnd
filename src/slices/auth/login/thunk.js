//Include Both Helper File with needed methods
// import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postLogin
} from "../../../helpers/backend_helper";
import { toast } from 'react-toastify';
import { apiError, loginSuccess, logoutUserSuccess } from './reducer';

export const loginUser = (user, history) => async (dispatch) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH) {
      response = postLogin({
        username: user.username,
        password: user.password,
      });
    }

    const data = await response;
    // console.log("response",data);
    // console.log("status",data.status)
    if (data.status === "error") {
      // Show toast for server-reported error
      toast.error(data.error || "Login failed", { position: "top-right" });
      // dispatch(apiError(data.error || "Login failed"));
    } else if (data.status === "success") {
      // Success: save user, dispatch, redirect
      sessionStorage.setItem("authUser", JSON.stringify(data));
      // console.log("sss", data?.user)
      if (data?.user?._id === "687b2c74205cd4f205f640b6") {
        history('/dashboard');

      }
      else {
        // console.log("dddd")
        history('/group-lessons');


      }
    } else {
      // Unexpected shape of response
      toast.error("Unexpected response from server.", { position: "top-right" });
      dispatch(apiError("Unexpected response from server."));
    }

    return data;  // ← Always return the data to caller

  } catch (error) {
    // console.log("error:", error.message)
    toast.error("Network error or server unavailable.", { position: "top-right" });
    dispatch(apiError(error.message || "Network error"));
    return { status: "error", error: error.message || "Network error" };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    sessionStorage.removeItem("authUser");

    dispatch(logoutUserSuccess(true));


  } catch (error) {
    dispatch(apiError(error));
  }
};
