import { api } from "./api";

export const startupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Profile Management
    getStartupProfile: builder.query({
      query: () => '/startup/auth/profile',
      providesTags: ['StartupProfile'],
    }),
    
    updateStartupProfile: builder.mutation({
      query: (profileData) => ({
        url: '/startup/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['StartupProfile'],
    }),
    
    // Onboarding
    updateOnboardingStep: builder.mutation({
      query: ({ step, data }) => ({
        url: '/startup/auth/onboarding',
        method: 'PUT',
        body: { step, data },
      }),
      invalidatesTags: ['StartupProfile'],
    }),
    
    getOnboardingStatus: builder.query({
      query: () => '/startup/auth/onboarding',
      providesTags: ['StartupProfile'],
    }),
    
    // Password Management
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/startup/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    
    // Account Management
    deactivateAccount: builder.mutation({
      query: (reason) => ({
        url: '/startup/auth/deactivate',
        method: 'POST',
        body: { reason },
      }),
    }),
    
    reactivateAccount: builder.mutation({
      query: (token) => ({
        url: '/startup/auth/reactivate',
        method: 'POST',
        body: { token },
      }),
    }),
    
    // Dashboard Data
    getDashboardData: builder.query({
      query: () => '/startup/dashboard',
      providesTags: ['Startup'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStartupProfileQuery,
  useUpdateStartupProfileMutation,
  useUpdateOnboardingStepMutation,
  useGetOnboardingStatusQuery,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
  useReactivateAccountMutation,
  useGetDashboardDataQuery,
} = startupApi;

// Export aliases for store.js compatibility
export const useGetStartupsQuery = useGetDashboardDataQuery;
export const useGetStartupByIdQuery = () => {
  throw new Error('useGetStartupByIdQuery not implemented');
};
export const useGetMyStartupQuery = useGetStartupProfileQuery;
export const useCreateStartupMutation = () => {
  throw new Error('useCreateStartupMutation not implemented');
};
export const useUpdateStartupMutation = useUpdateStartupProfileMutation;
export const useDeleteStartupMutation = useDeactivateAccountMutation;
export const useUploadStartupDocumentsMutation = () => {
  throw new Error('useUploadStartupDocumentsMutation not implemented');
};
export const useGetStartupAnalyticsQuery = () => {
  throw new Error('useGetStartupAnalyticsQuery not implemented');
};
export const useGetProfileQuery = useGetStartupProfileQuery;
export const useUpdateProfileMutation = useUpdateStartupProfileMutation;
