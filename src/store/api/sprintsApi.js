import { api } from "./api";

// Both startup and admin endpoints for sprints
export const sprintsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Startup: Get proposals by questionnaireId
    getProposalsByQuestionnaire: builder.query({
      query: (questionnaireId) => ({
        url: `/sprints/questionnaire/${questionnaireId}/proposals`,
        method: "GET"
      }),
      providesTags: ["Proposals"],
    }),
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
    // Startup: Get sprints by questionnaireId (NEW)
    getSprintsByQuestionnaire: builder.query({
      query: (questionnaireId) => ({
        url: `/sprints/by-questionnaire/${questionnaireId}`,
        method: "GET"
      }),
      providesTags: ["Sprints"],
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
      invalidatesTags: ["Sprints", "MySprints"],
    }),
    // Startup: Upload documents
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/sprints/${id}/upload-documents`,
        method: "POST",
        body, // body should be the FormData object itself
      }),
      invalidatesTags: ["Sprints", "MySprints"],
    }),
    // Startup: Schedule meeting
    scheduleMeeting: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sprints/${id}/schedule-meeting`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sprints", "MySprints"],
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
    // Startup: Delete sprint (NEW)
    deleteSprint: builder.mutation({
      query: (id) => ({
        url: `/sprints/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sprints", "MySprints", "Sprint"],
    }),
    // Startup: Create temp sprint (NEW)
    createTempSprint: builder.mutation({
      query: ({ questionnaireId, name, description, type, estimatedDuration }) => ({
        url: "/sprints/startup/create-temp",
        method: "POST",
        body: { questionnaireId, name, description, type, estimatedDuration },
      }),
      invalidatesTags: ["MySprints"],
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
  useGetProposalsByQuestionnaireQuery,
  // Startup exports
  useGetSprintsQuery,
  useGetMySprintsQuery,
  useGetSprintByIdQuery,
  useSelectPackageMutation,
  useUploadDocumentsMutation,
  useScheduleMeetingMutation,
  useFinishSprintMutation,
  useGetSprintsByQuestionnaireQuery,
  useDeleteSprintMutation,
  useCreateTempSprintMutation,
  // Admin exports
  useGetAllSprintsQuery,
  useCreateSprintMutation,
  useUpdateSprintStatusMutation,
  useUpdateSelectedPackagePaymentStatusMutation,
} = sprintsApi;
