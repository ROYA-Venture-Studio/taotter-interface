import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetChatListQuery } from '../../store/api/chatApi';
import './ChatList.css';

export default function ChatList({ onChatSelect }) {
  const navigate = useNavigate();
  const { id: selectedChatId } = useParams();

  // Fetch real chat list for startup
  const { data, isLoading, error } = useGetChatListQuery();

  const handleChatClick = (chatId) => {
    navigate(`/startup/chat/${chatId}`);
    onChatSelect && onChatSelect(chatId);
  };

  // Transform chat data for display
  let chats = [];
  if (data && data.data && data.data.chats) {
    chats = data.data.chats.map(chat => {
      const admin = chat.adminId;
      return {
        id: chat._id,
        name: admin?.profile
          ? `${admin.profile.firstName || ""} ${admin.profile.lastName || ""}`.trim()
          : admin?.email || "Admin",
        role: "Admin",
        lastActive: chat.lastMessageAt
          ? new Date(chat.lastMessageAt).toLocaleString()
          : "",
        isOnline: true // TODO: Replace with real online status if available
      };
    });
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2 className="chat-list-title">Chats</h2>
      </div>
      
      <div className="chat-list-search-container">
        <input
          type="text"
          placeholder="Search"
          className="chat-list-search-input"
        />
      </div>
      
      <div className="chat-list-items">
        {isLoading && (
          <div className="chat-list-loading">Loading chats...</div>
        )}
        {error && (
          <div className="chat-list-error">Failed to load chats.</div>
        )}
        {!isLoading && !error && chats.length === 0 && (
          <div className="chat-list-empty">
            No chats available yet
          </div>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${selectedChatId === chat.id ? 'active' : ''}`}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="chat-avatar">
              <div className={`status-indicator ${chat.isOnline ? 'online' : 'offline'}`}></div>
            </div>
            <div className="chat-info">
              <div className="name-and-time">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.lastActive}</span>
              </div>
              <span className="chat-role">{chat.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}