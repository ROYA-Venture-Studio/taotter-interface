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
    // Edit a task (admin)
    editTask: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `/tasks/${taskId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    // Delete a task (admin)
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    // Edit a task (startup)
    editStartupTask: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `/tasks/startup/${taskId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Board", "Boards"],
    }),
    // Delete a task (startup)
    deleteStartupTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/startup/${taskId}`,
        method: "DELETE",
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
  useEditTaskMutation,
  useDeleteTaskMutation,
  useEditStartupTaskMutation,
  useDeleteStartupTaskMutation,
} = tasksApi;
