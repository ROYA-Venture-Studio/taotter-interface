import { api } from "./api";

export const questionnairesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // For Startups
    getMyQuestionnaire: builder.query({
      query: () => '/questionnaires/my-questionnaire',
      providesTags: ['Questionnaire'],
    }),
    
    createQuestionnaire: builder.mutation({
      query: (questionnaireData) => ({
        url: '/questionnaires',
        method: 'POST',
        body: questionnaireData,
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    updateQuestionnaire: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/questionnaires/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    submitQuestionnaire: builder.mutation({
      query: (id) => ({
        url: `/questionnaires/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    // For Admins - Review & Management
    getQuestionnaires: builder.query({
      query: (params = {}) => ({
        url: '/questionnaires',
        params,
      }),
      providesTags: ['Questionnaire'],
    }),
    getAllAdminQuestionnaires: builder.query({
      query: (params = {}) => ({
        url: '/questionnaires/admin/all',
        params,
      }),
      providesTags: ['Questionnaire'],
    }),
    getAdminQuestionnaireById: builder.query({
      query: (id) => `/questionnaires/admin/${id}`,
      providesTags: ['Questionnaire'],
    }),
    createSprintsForQuestionnaire: builder.mutation({
      query: ({ id, sprints }) => ({
        url: `/questionnaires/admin/${id}/create-sprint`,
        method: 'POST',
        body: { sprints },
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    getQuestionnaireById: builder.query({
      query: (id) => `/questionnaires/${id}`,
      providesTags: ['Questionnaire'],
    }),
    
    reviewQuestionnaire: builder.mutation({
      query: ({ id, action, feedback, notes }) => ({
        url: `/questionnaires/${id}/review`,
        method: 'POST',
        body: { action, feedback, notes },
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    addQuestionnaireComment: builder.mutation({
      query: ({ id, content, isInternal }) => ({
        url: `/questionnaires/${id}/comments`,
        method: 'POST',
        body: { content, isInternal },
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    updateQuestionnaireComment: builder.mutation({
      query: ({ id, commentId, content }) => ({
        url: `/questionnaires/${id}/comments/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    deleteQuestionnaireComment: builder.mutation({
      query: ({ id, commentId }) => ({
        url: `/questionnaires/${id}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    
    // Template Management (Admin only)
    getQuestionnaireTemplates: builder.query({
      query: () => '/questionnaires/templates',
      providesTags: ['QuestionnaireTemplate'],
    }),
    
    createQuestionnaireTemplate: builder.mutation({
      query: (templateData) => ({
        url: '/questionnaires/templates',
        method: 'POST',
        body: templateData,
      }),
      invalidatesTags: ['QuestionnaireTemplate'],
    }),
    
    updateQuestionnaireTemplate: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/questionnaires/templates/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['QuestionnaireTemplate'],
    }),
    
    deleteQuestionnaireTemplate: builder.mutation({
      query: (id) => ({
        url: `/questionnaires/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QuestionnaireTemplate'],
    }),
    
    // File Upload for questionnaire attachments
    uploadQuestionnaireFile: builder.mutation({
      query: ({ id, file, fieldName }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fieldName', fieldName)
        
        return {
          url: `/questionnaires/${id}/upload`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Questionnaire'],
    }),
    
    // Analytics
    getQuestionnaireAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/questionnaires/analytics',
        params,
      }),
    }),

    // Link anonymous questionnaire to startup after registration
    linkQuestionnaire: builder.mutation({
      query: (temporaryId) => ({
        url: '/questionnaires/link',
        method: 'POST',
        body: { temporaryId },
      }),
      invalidatesTags: ['Questionnaire'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyQuestionnaireQuery,
  useCreateQuestionnaireMutation,
  useUpdateQuestionnaireMutation,
  useSubmitQuestionnaireMutation,
  useGetQuestionnairesQuery,
  useGetQuestionnaireByIdQuery,
  useReviewQuestionnaireMutation,
  useAddQuestionnaireCommentMutation,
  useUpdateQuestionnaireCommentMutation,
  useDeleteQuestionnaireCommentMutation,
  useGetQuestionnaireTemplatesQuery,
  useCreateQuestionnaireTemplateMutation,
  useUpdateQuestionnaireTemplateMutation,
  useDeleteQuestionnaireTemplateMutation,
  useUploadQuestionnaireFileMutation,
  useGetQuestionnaireAnalyticsQuery,
  useLinkQuestionnaireMutation,
  useGetAllAdminQuestionnairesQuery,
  useGetAdminQuestionnaireByIdQuery,
  useCreateSprintsForQuestionnaireMutation,
} = questionnairesApi;

// Export aliases for store.js compatibility
export const useDeleteQuestionnaireMutation = useDeleteQuestionnaireTemplateMutation;
export const useCreateQuestionnaireFromTemplateMutation = useCreateQuestionnaireTemplateMutation;
export const useSaveQuestionnaireAsTemplateMutation = useCreateQuestionnaireTemplateMutation;
