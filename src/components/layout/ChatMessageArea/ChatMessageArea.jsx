import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetChatListQuery, useGetMessagesQuery, useSendMessageMutation } from '../../../store/api/chatApi';
import useSocket from '../../../hooks/useSocket';
import styles from './ChatMessageArea.module.css';
import MessageBubble from "../../chat/MessageBubble";
import MessageInput from "../../chat/MessageInput";
import VoiceRecorder from "../../chat/VoiceRecorder";

export default function ChatMessageArea({ searchQuery }) {
  const { id: chatId } = useParams();
  // Try Redux first, fallback to localStorage if undefined
  let currentUser = useSelector(state => state.auth.user);
  if (!currentUser) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      currentUser = null;
    }
  }

  // Fetch chat list to get admin contact info
  const { data: chatListData } = useGetChatListQuery();
  // Fetch messages for the selected chat
  const { data, isLoading, error, refetch } = useGetMessagesQuery(
    chatId ? { chatId, page: 1, pageSize: 50 } : undefined,
    { skip: !chatId }
  );
  // Send message mutation
  const [sendMessage] = useSendMessageMutation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Find current chat and admin contact info
  const currentChat = chatListData?.data?.chats?.find(chat => chat._id === chatId);
  const admin = currentChat?.adminId;
  const contact = admin
    ? {
        id: admin._id,
        name: admin.profile
          ? `${admin.profile.firstName || ""} ${admin.profile.lastName || ""}`.trim()
          : admin.email || "Admin",
        avatar: "/assets/icons/User.svg",
        isOnline: true // TODO: Replace with real status
      }
    : { id: chatId, name: "Admin", avatar: "/assets/icons/User.svg", isOnline: false };

  // Real-time socket integration
  const socket = useSocket({
    onMessage: (msg) => {
      console.log('Socket message received:', msg);
      if (msg.conversationId === chatId) {
        // Get current user ID for comparison
        const currentUserId = String(currentUser?.id || currentUser?._id || '');
        const msgSenderId = String(msg.senderId || msg.userId || '');
        
        // Determine if this is the current user's message
        const isMyMessage = msg.senderType === 'startup' && msgSenderId === currentUserId;
        
        console.log('Real-time message alignment check:', {
          senderType: msg.senderType,
          msgSenderId,
          currentUserId,
          isMyMessage
        });
        
        // Transform the real-time message to match our format
        const transformedMsg = {
          id: msg._id,
          user: msg.senderType === 'admin'
            ? { name: contact.name, avatar: contact.avatar, isOnline: contact.isOnline }
            : { name: currentUser?.profile?.founderFirstName || "Me", avatar: "/assets/icons/User.svg", isOnline: true },
          content: msg.content || "",
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
          isOwnMessage: isMyMessage,
          hasImage: !!msg.imageUrl,
          imageUrl: msg.imageUrl || null
        };
        setMessages(prev => {
          // Deduplicate by message id (handle both string and object id)
          if (prev.some(m => String(m.id) === String(transformedMsg.id))) {
            return prev;
          }
          return [...prev, transformedMsg];
        });
      }
    },
    onUserTyping: (data) => {
      if (data.conversationId === chatId) {
        setIsTyping(data.isTyping);
      }
    }
  });

  // Join chat room on mount/change
  useEffect(() => {
    if (chatId && socket.joinConversation) {
      socket.joinConversation(chatId);
    }
    return () => {
      if (chatId && socket.leaveConversation) {
        socket.leaveConversation(chatId);
      }
    };
    // Only run when chatId changes, not on every render
    // eslint-disable-next-line
  }, [chatId]);

  // Load messages from API and transform them
  useEffect(() => {
    if (data && data.data && data.data.messages) {
      // Only set messages from API if messages array is empty (initial load)
      setMessages(prev => {
        if (prev.length > 0) return prev;
        
        // Get current user ID for comparison
        const currentUserId = String(currentUser?.id || currentUser?._id || '');
        
        const transformedMessages = data.data.messages.map(msg => {
          // Debug logs for alignment
          const senderType = msg.senderType;
          const senderId = String(msg.senderId || '');
          const isMine = senderType === 'startup' && senderId === currentUserId;
          
          console.log('API message alignment check:', {
            msgId: msg._id,
            senderType,
            senderId,
            currentUserId,
            isMine
          });
          
          return {
            id: msg._id,
            user: msg.senderType === 'admin'
              ? { name: contact.name, avatar: contact.avatar, isOnline: contact.isOnline }
              : { name: currentUser?.profile?.founderFirstName || "Me", avatar: "/assets/icons/User.svg", isOnline: true },
            content: msg.content || "",
            timestamp: new Date(msg.createdAt).toLocaleTimeString(),
            isOwnMessage: isMine,
            hasImage: !!msg.imageUrl,
            imageUrl: msg.imageUrl || null
          };
        });
        return transformedMessages;
      });
    }
  }, [data, contact, currentUser]);

  // Handle sending a message
  const handleSend = useCallback(
    async (msg, file) => {
      if (!msg && !file) return;
      try {
        // Send via REST for persistence
        await sendMessage({ chatId, content: msg, file }).unwrap();
        setInput("");
      } catch (err) {
        alert("Failed to send message");
      }
    },
    [chatId, sendMessage, socket, refetch]
  );

  // Typing indicator
  const handleTyping = useCallback(
    (typing) => {
      socket.sendTyping && socket.sendTyping(chatId, typing);
    },
    [chatId, socket]
  );

  // Scroll to bottom on new messages (DISABLED for debugging forced scroll)
  // const messagesEndRef = useRef(null);
  // const messagesWrapperRef = useRef(null);

  // useEffect(() => {
  //   if (!messagesWrapperRef.current) return;
  //   const wrapper = messagesWrapperRef.current;
  //   const isNearBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight < 80;
  //   if (isNearBottom) {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  //   // else, don't auto-scroll so user can read history
  // }, [messages]);
  const messagesEndRef = useRef(null);
  const messagesWrapperRef = useRef(null);

  // Auto-scroll to bottom on mount and when messages change (only chat container)
  useEffect(() => {
    if (messagesWrapperRef.current) {
      messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
    }
  }, [messages]);

  // Restore original scroll-to-bottom logic using messagesEndRef
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  // Search and scroll-to-message logic using searchQuery from parent
  const messageRefs = useRef({});
  useEffect(() => {
    if (
      searchQuery &&
      messages.length > 0
    ) {
      // Find first matching message
      const idx = messages.findIndex(msg =>
        msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (idx !== -1 && messageRefs.current[idx]) {
        messageRefs.current[idx].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchQuery, messages]);

  return (
    <div className={styles.messageArea}>
      <section className="admin-chat-area">
        <div className="admin-chat-area__header">
          <div className="admin-chat-area__user">
            <div className="admin-chat-area__avatar-wrap">
              <img src={contact.avatar} alt={contact.name} className="admin-chat-area__avatar" />
              <span
                className={`admin-chat-area__status admin-chat-area__status--${contact.isOnline ? "online" : "offline"}`}
                title={contact.isOnline ? "online" : "offline"}
              />
            </div>
            <span className="admin-chat-area__name">{contact.name}</span>
          </div>
          <div className="admin-chat-area__actions">
            <button className="admin-chat-area__icon-btn" aria-label="Menu">
              <svg width="4" height="16" fill="none" viewBox="0 0 4 16">
                <path d="M2.18262 12.2588C3.06529 12.3482 3.75391 13.0937 3.75391 14C3.75391 14.9063 3.06529 15.6518 2.18262 15.7412L2.00391 15.75H1.99414C1.02764 15.75 0.244141 14.9665 0.244141 14C0.244141 13.0335 1.02764 12.25 1.99414 12.25H2.00391L2.18262 12.2588ZM2.18262 6.25879C3.06529 6.34819 3.75391 7.09375 3.75391 8C3.75391 8.90625 3.06529 9.65181 2.18262 9.74121L2.00391 9.75H1.99414C1.02764 9.75 0.244141 8.9665 0.244141 8C0.244141 7.0335 1.02764 6.25 1.99414 6.25H2.00391L2.18262 6.25879ZM2.18262 0.258789C3.06529 0.348189 3.75391 1.09375 3.75391 2C3.75391 2.90625 3.06529 3.65181 2.18262 3.74121L2.00391 3.75H1.99414C1.02764 3.75 0.244141 2.9665 0.244141 2C0.244141 1.0335 1.02764 0.25 1.99414 0.25H2.00391L2.18262 0.258789Z" fill="#344054" />
              </svg>
            </button>
          </div>
        </div>
        <div className="admin-chat-area__messages">
          {isLoading ? (
            <div className="admin-chat-area__loading">Loading messages...</div>
          ) : error ? (
            <div className="admin-chat-area__error">Failed to load messages</div>
          ) : (
            messages.map((message, idx) => {
              const isMatch =
                searchQuery &&
                message.content &&
                message.content.toLowerCase().includes(searchQuery.toLowerCase());
              return (
                <div
                  key={message.id}
                  ref={el => (messageRefs.current[idx] = el)}
                  style={isMatch ? { background: "#fffbe6" } : undefined}
                >
                  <MessageBubble message={message} isOwn={message.isOwnMessage} />
                </div>
              );
            })
          )}
          {isTyping && <div className="admin-chat-area__typing">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div
          className="admin-chat-area__input-row"
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: "12px",
            background: "#fff",
            padding: "12px 16px",
            borderTop: "1px solid #eee"
          }}
        >
          <div style={{ flex: 1 }}>
            <MessageInput
              chatId={contact.id}
              forceSendEnabled={true}
              content={input}
              onChange={setInput}
              onSend={handleSend}
              showMic={false}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <VoiceRecorder
              onRecordComplete={(blob, duration) => handleSend("", blob, duration)}
              disabled={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
