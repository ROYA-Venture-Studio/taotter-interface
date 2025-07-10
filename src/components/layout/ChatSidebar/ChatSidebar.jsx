import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetChatListQuery } from '../../../store/api/chatApi';
import styles from './ChatSidebar.module.css';
import Icon from '../../ui/Icon/Icon';

export default function ChatSidebar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch real chat list for startup
  const { data, isLoading, error } = useGetChatListQuery();

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

  // Filter chats by search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected chatId from URL
  const selectedChatId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/chat/')[1]
    : null;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>Chats</span>
        <div className={styles.menuButton}>
          <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.18262 12.2588C3.06529 12.3482 3.75391 13.0937 3.75391 14C3.75391 14.9063 3.06529 15.6518 2.18262 15.7412L2.00391 15.75H1.99414C1.02764 15.75 0.244141 14.9665 0.244141 14C0.244141 13.0335 1.02764 12.25 1.99414 12.25H2.00391L2.18262 12.2588ZM2.18262 6.25879C3.06529 6.34819 3.75391 7.09375 3.75391 8C3.75391 8.90625 3.06529 9.65181 2.18262 9.74121L2.00391 9.75H1.99414C1.02764 9.75 0.244141 8.9665 0.244141 8C0.244141 7.0335 1.02764 6.25 1.99414 6.25H2.00391L2.18262 6.25879ZM2.18262 0.258789C3.06529 0.348189 3.75391 1.09375 3.75391 2C3.75391 2.90625 3.06529 3.65181 2.18262 3.74121L2.00391 3.75H1.99414C1.02764 3.75 0.244141 2.9665 0.244141 2C0.244141 1.0335 1.02764 0.25 1.99414 0.25H2.00391L2.18262 0.258789Z" fill="#667085" />
          </svg>
        </div>
      </div>
      
      <div className={styles.searchSection}>
        <div className={styles.menuIcon}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.0771 12.2539C17.4551 12.2925 17.75 12.6118 17.75 13C17.75 13.3882 17.4551 13.7075 17.0771 13.7461L17 13.75H1C0.585786 13.75 0.25 13.4142 0.25 13C0.250001 12.5858 0.585787 12.25 1 12.25H17L17.0771 12.2539ZM17.0771 6.25391C17.4551 6.29253 17.75 6.61183 17.75 7C17.75 7.38817 17.4551 7.70747 17.0771 7.74609L17 7.75H1C0.585786 7.75 0.25 7.41421 0.25 7C0.250001 6.58579 0.585787 6.25 1 6.25H17L17.0771 6.25391ZM17.0771 0.253906C17.4551 0.292528 17.75 0.611834 17.75 1C17.75 1.38817 17.4551 1.70747 17.0771 1.74609L17 1.75H1C0.585786 1.75 0.25 1.41421 0.25 1C0.250001 0.585787 0.585787 0.25 1 0.25H17L17.0771 0.253906Z" fill="#344054" />
          </svg>
        </div>
        
        <div className={styles.searchInputWrapper}>
          <div className={styles.searchIconContainer}>
            <Icon name="Search" size={18} className={styles.searchIcon} />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchField}
          />
        </div>
      </div>

      <div className={styles.chatList}>
        {isLoading && <div>Loading chats...</div>}
        {error && <div style={{ color: "red" }}>Failed to load chats.</div>}
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.selected : ""}`}
            onClick={() => navigate(`/chat/${chat.id}`)}
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
