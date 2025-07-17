import { toast } from "react-toastify";

/**
 * Handles API responses and shows toast notifications.
 *
 * @param {Object} response - The response object from the API call.
 * @param {string} successMsg - Fallback success message.
 * @param {string} errorMsg - Fallback error message.
 */
const handleApiResponse = (response, successMsg, errorMsg) => {
  if (response?.success) {
    toast.success(response.message || successMsg, { autoClose: 3000 });
  } else {
    const message =
      response?.message || response?.error || errorMsg || "Something went wrong please contact admin";
    toast.error(message, { autoClose: 3000 });
  }
};

export default handleApiResponse;
