import { api } from "./api";

// Task types for admin
export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new task (admin)
    createTask: builder.mutation({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    // Move a task (admin)
    moveTask: builder.mutation({
      query: ({ taskId, columnId, position }) => ({
        url: `/tasks/${taskId}/move`,
        method: "POST",
        body: { columnId, position },
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    
    // Create a new task (startup)
    createStartupTask: builder.mutation({
      query: (body) => ({
        url: "/tasks/startup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    
    // Move a task (startup)
    moveStartupTask: builder.mutation({
      query: ({ taskId, columnId, position }) => ({
        url: `/tasks/startup/${taskId}/move`,
        method: "POST",
        body: { columnId, position },
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    // ...other endpoints
  }),
});

export const {
  useCreateTaskMutation,
  useMoveTaskMutation,
  useCreateStartupTaskMutation,
  useMoveStartupTaskMutation,
} = tasksApi;
