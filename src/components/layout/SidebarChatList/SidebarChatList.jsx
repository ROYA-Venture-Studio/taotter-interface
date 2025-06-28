import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetChatListQuery } from '../../../store/api/chatApi';
import styles from './SidebarChatList.module.css';

export default function SidebarChatList({ onClose, isClosing = false }) {
  const navigate = useNavigate();

  // Fetch real chat list for startup
  const { data, isLoading, error } = useGetChatListQuery();

  const handleChatClick = (chatId) => {
    navigate(`/startup/chat/${chatId}`);
    onClose && onClose();
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
    <div className={`${styles.chatList} ${isClosing ? styles.closing : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>Chat</span>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close chat list"
        >
          ×
        </button>
      </div>
      
      <div className={styles.chatItems}>
        {isLoading && <div>Loading chats...</div>}
        {error && <div style={{ color: "red" }}>Failed to load chats.</div>}
        {!isLoading && !error && chats.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", color: "#667085", fontSize: "14px" }}>
            No chats available yet
          </div>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={styles.chatItem}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className={styles.avatar}>
              <div className={`${styles.statusIndicator} ${chat.isOnline ? styles.online : styles.offline}`}></div>
            </div>
            <div className={styles.chatInfo}>
              <div className={styles.nameAndTime}>
                <span className={styles.name}>{chat.name}</span>
                <span className={styles.time}>{chat.lastActive}</span>
              </div>
              <span className={styles.role}>{chat.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
