import { api } from "./api";

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Analytics
    getDashboardAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/dashboard',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Startup Onboarding Analytics
    getStartupOnboardingAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/startup-onboarding',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Project Performance Analytics
    getProjectPerformanceAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/project-performance',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Admin Workload Analytics
    getAdminWorkloadAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/admin-workload',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Custom Analytics Queries
    getCustomAnalytics: builder.query({
      query: ({ type, ...params }) => ({
        url: `/analytics/custom/${type}`,
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Real-time Analytics
    getRealTimeMetrics: builder.query({
      query: () => '/analytics/real-time',
      providesTags: ['Analytics'],
      // Polling for real-time updates
      pollingInterval: 30000, // 30 seconds
    }),
    
    // Export Analytics
    exportAnalyticsData: builder.mutation({
      query: ({ type, format, params }) => ({
        url: `/analytics/export/${type}`,
        method: 'POST',
        body: { format, params },
      }),
    }),
    
    // Team Performance
    getTeamPerformance: builder.query({
      query: (params = {}) => ({
        url: '/analytics/team-performance',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Individual Performance
    getIndividualPerformance: builder.query({
      query: ({ userId, ...params }) => ({
        url: `/analytics/individual-performance/${userId}`,
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Revenue Analytics
    getRevenueAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/revenue',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Client Satisfaction Analytics
    getClientSatisfactionAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/client-satisfaction',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Time Tracking Analytics
    getTimeTrackingAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/time-tracking',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Sprint Analytics
    getSprintAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/sprints',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Task Analytics
    getTaskAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/tasks',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Board Analytics
    getBoardAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/boards',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Questionnaire Analytics
    getQuestionnaireAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/questionnaires',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Growth Analytics
    getGrowthAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/growth',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Conversion Analytics
    getConversionAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/conversion',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Resource Utilization Analytics
    getResourceUtilizationAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/resource-utilization',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Trend Analytics
    getTrendAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/trends',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Comparative Analytics
    getComparativeAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/comparative',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Predictive Analytics
    getPredictiveAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/predictive',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Cost Analytics
    getCostAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/cost',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Quality Analytics
    getQualityAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/quality',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Risk Analytics
    getRiskAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/risk',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Capacity Analytics
    getCapacityAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/capacity',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Historical Data
    getHistoricalData: builder.query({
      query: (params = {}) => ({
        url: '/analytics/historical',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Benchmark Analytics
    getBenchmarkAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/benchmark',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetStartupOnboardingAnalyticsQuery,
  useGetProjectPerformanceAnalyticsQuery,
  useGetAdminWorkloadAnalyticsQuery,
  useGetCustomAnalyticsQuery,
  useGetRealTimeMetricsQuery,
  useExportAnalyticsDataMutation,
  useGetTeamPerformanceQuery,
  useGetIndividualPerformanceQuery,
  useGetRevenueAnalyticsQuery,
  useGetClientSatisfactionAnalyticsQuery,
  useGetTimeTrackingAnalyticsQuery,
  useGetSprintAnalyticsQuery,
  useGetTaskAnalyticsQuery,
  useGetBoardAnalyticsQuery,
  useGetQuestionnaireAnalyticsQuery,
  useGetGrowthAnalyticsQuery,
  useGetConversionAnalyticsQuery,
  useGetResourceUtilizationAnalyticsQuery,
  useGetTrendAnalyticsQuery,
  useGetComparativeAnalyticsQuery,
  useGetPredictiveAnalyticsQuery,
  useGetCostAnalyticsQuery,
  useGetQualityAnalyticsQuery,
  useGetRiskAnalyticsQuery,
  useGetCapacityAnalyticsQuery,
  useGetHistoricalDataQuery,
  useGetBenchmarkAnalyticsQuery,
} = analyticsApi;
