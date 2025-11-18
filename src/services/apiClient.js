const API_BASE_URL =
  (import.meta?.env?.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  "http://localhost:8080/api/v1.0";

const isJsonResponse = (response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json");
};

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) return "";
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

const buildError = (response, data) => {
  const message =
    (data && (data.message || data.error)) ||
    response.statusText ||
    "Request failed";
  const error = new Error(message);
  error.status = response.status;
  error.data = data;
  return error;
};

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}${normalizeEndpoint(endpoint)}`,
    options
  );

  const data = isJsonResponse(response)
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw buildError(response, data);
  }

  return data;
};

export { API_BASE_URL };
