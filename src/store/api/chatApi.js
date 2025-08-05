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
      query: ({ chatId, page = 1, pageSize = 50 }) =>
        `/chat/${chatId}/messages?page=${page}&pageSize=${pageSize}`,
      providesTags: (result, error, { chatId }) => [{ type: 'Message', id: chatId }],
    }),
    sendMessage: builder.mutation({
      query: ({ chatId, content, file, voice, voiceDuration }) => {
        const formData = new FormData();
        if (file) formData.append('file', file);
        if (voice) formData.append('file', voice);
        if (content) formData.append('content', content);
        if (voiceDuration) formData.append('voiceDuration', voiceDuration);
        return {
          url: `/chat/${chatId}/message`,
          method: 'POST',
          body: formData,
        };
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
