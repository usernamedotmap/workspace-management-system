import { CustomError } from "@/types/custom-error.type";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { queryClient } from "./react-query";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL,

  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

let isRefreshing = false;
let isRedirecting = false; // Prevent multiple redirects
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (!isRedirecting) {
    isRedirecting = true;
    // Use replace to avoid adding to history
    window.location.replace("/");
  }
};

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { data, status } = error.response;

    // Only handle 401s with "Access token expired" message
    if (
      status === 401 && 
      (data as any)?.message === "Access token expired" &&
      !originalRequest._retry
    ) {
      // Don't try to refresh if this IS the refresh request
      if (originalRequest.url?.includes("auth/refresh")) {
        isRefreshing = false;
        processQueue(new Error("Refresh token expired"));
        queryClient.removeQueries({
          queryKey: ["authUser"],
        })
        redirectToLogin();
        return Promise.reject(error);
      }

      // Queue requests while refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await API.post("/auth/refresh");

        isRefreshing = false;
        processQueue();

        // Retry original request with new token
        return API(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError as Error);
        
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // For all other 401s (no token, invalid token, etc.) - just reject without redirecting
    // Let React Query and your ProtectedRoute handle the redirect
    if (status === 401) {
       queryClient.removeQueries({
          queryKey: ["authUser"],
        })
      const customError: CustomError = {
        ...error,
        errorCode: (data as any)?.errorCode || "UNAUTHORIZED",
      };
      return Promise.reject(customError);
    }

    // Handle other errors
    const customError: CustomError = {
      ...error,
      errorCode: (data as any)?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);


// API.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const { data, status } = error.response;

//     if (data === "Unauthorized" && status === 401) {
//       window.location.href = "/";
//     }

//     const customError: CustomError = {
//       ...error,
//       errorCode: data?.errorCode || "UNKNOWN_ERROR",
//     };

//     return Promise.reject(customError);
//   }
// );

export default API;
