import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Startup Authentication
    startupLogin: builder.mutation({
      query: (credentials) => ({
        url: '/startup/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    startupRegister: builder.mutation({
      query: (userData) => ({
        url: '/startup/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    startupForgotPassword: builder.mutation({
      query: (email) => ({
        url: '/startup/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    startupResetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/startup/auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
    
    verifyStartupEmail: builder.mutation({
      query: (token) => ({
        url: '/startup/auth/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),
    
    // Admin Authentication
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    adminForgotPassword: builder.mutation({
      query: (email) => ({
        url: '/admin/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    adminResetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/admin/auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
    
    // General Auth
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartupLoginMutation,
  useStartupRegisterMutation,
  useStartupForgotPasswordMutation,
  useStartupResetPasswordMutation,
  useVerifyStartupEmailMutation,
  useAdminLoginMutation,
  useAdminForgotPasswordMutation,
  useAdminResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;

// Export aliases for store.js compatibility
export const useLoginMutation = useStartupLoginMutation;
export const useRegisterMutation = useStartupRegisterMutation;
export const useForgotPasswordMutation = useStartupForgotPasswordMutation;
export const useResetPasswordMutation = useStartupResetPasswordMutation;
export const useVerifyEmailMutation = useVerifyStartupEmailMutation;
export const useResendVerificationMutation = useVerifyStartupEmailMutation; // Using same endpoint
export const useChangePasswordMutation = () => {
  throw new Error('useChangePasswordMutation should be imported from startupApi');
};
export const useUpdateProfileMutation = () => {
  throw new Error('useUpdateProfileMutation should be imported from startupApi');
};
export const useGetProfileQuery = useGetCurrentUserQuery;
