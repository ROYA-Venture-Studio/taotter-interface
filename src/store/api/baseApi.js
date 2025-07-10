import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {
          refreshToken: api.getState().auth.refreshToken
        }
      },
      api,
      extraOptions
    )
    
    if (refreshResult.data) {
      // Store the new token
      api.dispatch({ 
        type: 'auth/setCredentials', 
        payload: refreshResult.data 
      })
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh failed - logout user
      api.dispatch({ type: 'auth/logout' })
    }
  }
  
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Startup', 
    'Admin',
    'Questionnaire',
    'Sprint',
    'Board',
    'Task',
    'Analytics'
  ],
  endpoints: () => ({}),
})
