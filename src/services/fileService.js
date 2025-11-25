import { toast } from "react-toastify";
import { API_BASE_URL } from "./apiClient";
import { getStoredToken } from "./userService";

export const uploadFile = async (file) => {
  if (!file) {
    const message = "Không có tệp để tải lên.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }

  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Không thể tải ảnh lên.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload?.url) {
    return payload.url;
  }

  const message = "Phản hồi tải ảnh không hợp lệ.";
  toast.error(message);
  return Promise.reject(new Error(message));
};

const fileService = { uploadFile };

export default fileService;
