import React, { useEffect, useRef } from "react";
import { useGetMessagesQuery } from "../../store/api/chatApi";
import MessageBubble from "./MessageBubble";
import "./ChatContainer.css";

export default function ChatContainer({ chatId, userId }) {
  const { data, isLoading, isFetching, refetch } = useGetMessagesQuery({ chatId, page: 1, pageSize: 50 });
  const messages = data?.messages || [];
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container" ref={containerRef}>
      {isLoading || isFetching ? (
        <div className="chat-loading">Loading messages...</div>
      ) : (
        messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || idx}
            message={msg}
            isOwn={msg.senderId === userId}
          />
        ))
      )}
    </div>
  );
}
