import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// API slices
import { api } from './api/api'

// Import all API modules to ensure they inject their endpoints
import './api/authApi'
import './api/startupApi'
import './api/adminApi'
import './api/questionnairesApi'
import './api/sprintsApi'
import './api/boardsApi'
import './api/tasksApi'
import './api/analyticsApi'
import './api/chatApi'

// Redux slices
import authReducer from './slices/authSlice'
import questionnairesReducer from './slices/questionnairesSlice'
import sprintsReducer from './slices/sprintsSlice'
import boardsReducer from './slices/boardsSlice'
import tasksReducer from './slices/tasksSlice'
import analyticsReducer from './slices/analyticsSlice'
import uiReducer from './slices/uiSlice'

// Middleware for development
const isDevelopment = import.meta.env.MODE === 'development'

export const store = configureStore({
  reducer: {
    // API reducer - Only the main api since all others inject into it
    [api.reducerPath]: api.reducer,
    
    // State slices
    auth: authReducer,
    questionnaires: questionnairesReducer,
    sprints: sprintsReducer,
    boards: boardsReducer,
    tasks: tasksReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          // RTK Query action types
          'api/executeMutation/pending',
          'api/executeMutation/fulfilled',
          'api/executeMutation/rejected',
          'api/executeQuery/pending',
          'api/executeQuery/fulfilled',
          'api/executeQuery/rejected',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        // Ignore state paths for immutable check
        ignoredPaths: ['auth.user', 'ui.modals.confirmDialog.onConfirm', 'ui.modals.confirmDialog.onCancel'],
      },
    })
    .concat(
      // Add RTK Query middleware - only need the main api middleware
      api.middleware,
    ),
  
  // Enable Redux DevTools in development
  devTools: isDevelopment && {
    name: 'Startup Management Platform',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      // Sanitize sensitive data in development
      ...(action.type.includes('auth') && action.payload?.password && {
        payload: { ...action.payload, password: '[REDACTED]' }
      }),
    }),
    stateSanitizer: (state) => ({
      ...state,
      // Sanitize sensitive data in development
      auth: {
        ...state.auth,
        ...(state.auth.token && { token: '[REDACTED]' }),
        ...(state.auth.refreshToken && { refreshToken: '[REDACTED]' }),
      },
    }),
  },
  
  // Preloaded state can be provided for SSR or testing
  preloadedState: undefined,
})

// Enable listener behavior for RTK Query
setupListeners(store.dispatch)

// Initialize auth state from localStorage on store creation
import { initializeAuth } from './slices/authSlice'
store.dispatch(initializeAuth())

// Set up viewport listener for responsive design
if (typeof window !== 'undefined') {
  import('./slices/uiSlice').then(({ updateViewport }) => {
    const handleResize = () => {
      store.dispatch(updateViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      }))
    }
    
    window.addEventListener('resize', handleResize)
    
    // Initial viewport update
    handleResize()
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('resize', handleResize)
    })
  })
}

// Set up theme listener for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  import('./slices/uiSlice').then(({ setTheme }) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleThemeChange = (e) => {
      const currentTheme = store.getState().ui.theme
      if (currentTheme === 'system') {
        // Only dispatch if theme is set to system
        store.dispatch(setTheme('system'))
      }
    }
    
    mediaQuery.addEventListener('change', handleThemeChange)
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    })
  })
}

// Performance monitoring
if (isDevelopment && typeof window !== 'undefined') {
  import('./slices/uiSlice').then(({ setLoadTime, addApiResponseTime }) => {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      store.dispatch(setLoadTime(loadTime))
    })
    
    // Monitor API response times
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const response = await originalFetch(...args)
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      // Extract endpoint from URL
      const url = args[0]
      const endpoint = typeof url === 'string' ? url.split('?')[0] : url.url?.split('?')[0]
      
      if (endpoint) {
        store.dispatch(addApiResponseTime({ endpoint, time: responseTime }))
      }
      
      return response
    }
  })
}

// Export hooks for use in components
export { useAppDispatch, useAppSelector } from './hooks'

// Export all API hooks for easy importing
export {
  // Auth API
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
} from './api/authApi'

export {
  // Startup API
  useGetStartupsQuery,
  useGetStartupByIdQuery,
  useGetMyStartupQuery,
  useCreateStartupMutation,
  useUpdateStartupMutation,
  useDeleteStartupMutation,
  useUploadStartupDocumentsMutation,
  useGetStartupAnalyticsQuery,
} from './api/startupApi'

export {
  // Admin API
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
} from './api/adminApi'

export {
  // Questionnaires API
  useGetQuestionnairesQuery,
  useGetQuestionnaireByIdQuery,
  useCreateQuestionnaireMutation,
  useUpdateQuestionnaireMutation,
  useDeleteQuestionnaireMutation,
  useSubmitQuestionnaireMutation,
  useGetQuestionnaireTemplatesQuery,
  useCreateQuestionnaireFromTemplateMutation,
  useSaveQuestionnaireAsTemplateMutation,
  useReviewQuestionnaireMutation,
  useAddQuestionnaireCommentMutation,
} from './api/questionnairesApi'

export {
  // Sprints API
  useGetSprintsQuery,
  useGetMySprintsQuery,
  useGetSprintByIdQuery,
  useSelectPackageMutation,
  useUploadDocumentsMutation,
  useScheduleMeetingMutation,
  useGetAllSprintsQuery,
  useCreateSprintMutation,
  useUpdateSprintStatusMutation,
} from './api/sprintsApi'

export {
  // Boards API
  useGetBoardsQuery,
  useGetBoardQuery,
  useGetBoardBySprintQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useGetBoardAnalyticsQuery,
} from './api/boardsApi'

export {
  // Tasks API
  useCreateTaskMutation,
} from './api/tasksApi'

export {
  // Analytics API
  useGetDashboardAnalyticsQuery,
  useGetProjectPerformanceAnalyticsQuery,
  useGetTeamPerformanceQuery,
  useGetRevenueAnalyticsQuery,
  useGetTimeTrackingAnalyticsQuery,
  useGetSprintAnalyticsQuery,
  useGetTaskAnalyticsQuery,
  // useGetBoardAnalyticsQuery,
  useGetRealTimeMetricsQuery,
  useExportAnalyticsDataMutation,
} from './api/analyticsApi'

export default store
