import { api } from "./api";

// Both startup and admin endpoints for sprints
export const sprintsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Startup: Get available sprints
    getSprints: builder.query({
      query: (params) => ({
        url: "/sprints",
        params,
      }),
      providesTags: ["Sprints"],
    }),
    // Startup: Get my sprints
    getMySprints: builder.query({
      query: (params) => ({
        url: "/sprints/my-sprints",
        params,
      }),
      providesTags: ["MySprints"],
    }),
    // Startup: Get sprint by ID
    getSprintById: builder.query({
      query: (id) => `/sprints/${id}`,
      providesTags: (result, error, id) => [{ type: "Sprint", id }],
    }),
    // Startup: Select package
    selectPackage: builder.mutation({
      query: ({ id, packageId }) => ({
        url: `/sprints/${id}/select-package`,
        method: "POST",
        body: { packageId },
      }),
      invalidatesTags: ["Sprints", "MySprintQuery"],
    }),
    // Startup: Upload documents
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/sprints/${id}/upload-documents`,
        method: "POST",
        body, // body should be the FormData object itself
      }),
      invalidatesTags: ["Sprints", "MySprintQuery"],
    }),
    // Startup: Schedule meeting
    scheduleMeeting: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sprints/${id}/schedule-meeting`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sprints", "MySprintQuery"],
    }),
    // Startup: Finish sprint (NEW)
    finishSprint: builder.mutation({
      query: ({ id }) => ({
        url: `/sprints/startup/${id}/finish`,
        method: "PUT",
        body: { status: "completed" },
      }),
      invalidatesTags: ["Sprints", "MySprints", "Sprint"],
    }),
    // Admin: Get all sprints
    getAllSprints: builder.query({
      query: (params) => ({
        url: "/sprints/admin/all",
        params,
      }),
      providesTags: ["AdminSprints"],
    }),
    // Admin: Create sprint
    createSprint: builder.mutation({
      query: (body) => ({
        url: "/sprints/admin/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminSprints"],
    }),
    // Admin: Update sprint status
    updateSprintStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sprints/admin/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSprints"],
    }),
    // Admin: Update selected package payment status (sprint-level)
    updateSelectedPackagePaymentStatus: builder.mutation({
      query: ({ sprintId, paymentStatus }) => ({
        url: `/sprints/admin/${sprintId}/payment-status`,
        method: "PUT",
        body: { paymentStatus },
      }),
      invalidatesTags: ["AdminSprints"],
    }),
  }),
});

export const {
  // Startup exports
  useGetSprintsQuery,
  useGetMySprintsQuery,
  useGetSprintByIdQuery,
  useSelectPackageMutation,
  useUploadDocumentsMutation,
  useScheduleMeetingMutation,
  useFinishSprintMutation,
  // Admin exports
  useGetAllSprintsQuery,
  useCreateSprintMutation,
  useUpdateSprintStatusMutation,
  useUpdateSelectedPackagePaymentStatusMutation,
} = sprintsApi;
