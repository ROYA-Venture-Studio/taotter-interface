import { api } from "./api";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startChat: builder.mutation({
      query: ({ startupId }) => ({
        url: '/chat/start',
        method: 'POST',
        body: { startupId }
      }),
      invalidatesTags: ['Chat'],
    }),
    getChatList: builder.query({
      query: () => '/chat/list',
      providesTags: ['Chat'],
    }),
    getMessages: builder.query({
      query: (chatId) => `/chat/${chatId}/messages`,
      providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
    }),
    sendMessage: builder.mutation({
      query: ({ chatId, content, file }) => {
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          if (content) formData.append('content', content)
          return {
            url: `/chat/${chatId}/message`,
            method: 'POST',
            body: formData,
          }
        }
        return {
          url: `/chat/${chatId}/message`,
          method: 'POST',
          body: { content },
        }
      },
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Message', id: chatId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartChatMutation,
  useGetChatListQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
