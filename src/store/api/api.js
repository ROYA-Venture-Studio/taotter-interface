import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom baseQuery with automatic token refresh and redirect
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      // Try to refresh
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      if (refreshResult.data && refreshResult.data.accessToken) {
        // Store new tokens
        localStorage.setItem("token", refreshResult.data.accessToken);
        if (refreshResult.data.refreshToken) {
          localStorage.setItem("refreshToken", refreshResult.data.refreshToken);
        }
        // Retry original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Dispatch logout to Redux
        if (api.dispatch) {
          try {
            const { logout } = await import("../slices/authSlice");
            api.dispatch(logout());
          } catch (e) {}
        }
        // Determine user type for redirect
        let userType = localStorage.getItem("userType");
        if (!userType && api.getState) {
          try {
            userType = api.getState().auth?.userType;
          } catch (e) {}
        }
        if (typeof window !== "undefined") {
          if (userType === "admin") {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/startup/login";
          }
        }
        return { error: { status: 401, data: "Session expired" } };
      }
    } else {
      // No refresh token, redirect to login
      localStorage.removeItem("token");
      // Dispatch logout to Redux
      if (api.dispatch) {
        try {
          const { logout } = await import("../slices/authSlice");
          api.dispatch(logout());
        } catch (e) {}
      }
      // Determine user type for redirect
      let userType = localStorage.getItem("userType");
      if (!userType && api.getState) {
        try {
          userType = api.getState().auth?.userType;
        } catch (e) {}
      }
      if (typeof window !== "undefined") {
        if (userType === "admin") {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/startup/login";
        }
      }
      return { error: { status: 401, data: "Session expired" } };
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'User',
    'Startup', 
    'StartupProfile',
    'Admin',
    'AdminDashboard',
    'AdminUsers',
    'SystemSettings',
    'AuditLogs',
    'SystemStats',
    'Startups',
    'StartupSprints',
    'Questionnaire',
    'QuestionnaireTemplate',
    'Sprint',
    'Sprints',
    'MySprints',
    'AdminSprints',
    'Board',
    'Boards',
    'Task',
    'Tasks',
    'Analytics',
    'Chat',
    'Message'
  ],
  endpoints: () => ({}),
});
