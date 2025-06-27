import { api } from "./api";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin dashboard data
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    
    // Get all admin users
    getAdminUsers: builder.query({
      query: () => "/admin/users",
      providesTags: ["AdminUsers"],
    }),
    
    // Create admin user
    createAdminUser: builder.mutation({
      query: (userData) => ({
        url: "/admin/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    
    // Update admin user
    updateAdminUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    
    // Delete admin user
    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    
    // Get system settings
    getSystemSettings: builder.query({
      query: () => "/admin/settings",
      providesTags: ["SystemSettings"],
    }),
    
    // Update system settings
    updateSystemSettings: builder.mutation({
      query: (settings) => ({
        url: "/admin/settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["SystemSettings"],
    }),
    
    // Get audit logs
    getAuditLogs: builder.query({
      query: (params) => ({
        url: "/admin/audit-logs",
        params,
      }),
      providesTags: ["AuditLogs"],
    }),
    
    // Get system stats
    getSystemStats: builder.query({
      query: () => "/admin/system-stats",
      providesTags: ["SystemStats"],
    }),
    
    // Backup system
    backupSystem: builder.mutation({
      query: () => ({
        url: "/admin/backup",
        method: "POST",
      }),
      invalidatesTags: ["SystemStats"],
    }),
    
    // Restore system
    restoreSystem: builder.mutation({
      query: (backupFile) => ({
        url: "/admin/restore",
        method: "POST",
        body: backupFile,
      }),
      invalidatesTags: ["SystemStats", "AdminDashboard"],
    }),
    
    // Get all startups with sprint counts
    getStartups: builder.query({
      query: (params) => ({
        url: "/admin/startups",
        params,
      }),
      providesTags: ["Startups"],
    }),
    
    // Get sprints for a specific startup
    getStartupSprints: builder.query({
      query: ({ startupId, ...params }) => ({
        url: `/admin/startups/${startupId}/sprints`,
        params,
      }),
      providesTags: (result, error, { startupId }) => [
        { type: "StartupSprints", id: startupId },
      ],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetAuditLogsQuery,
  useGetSystemStatsQuery,
  useBackupSystemMutation,
  useRestoreSystemMutation,
  useGetStartupsQuery,
  useGetStartupSprintsQuery,
} = adminApi;
