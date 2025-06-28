import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetChatListQuery, useGetMessagesQuery, useSendMessageMutation } from '../../../store/api/chatApi';
import useSocket from '../../../hooks/useSocket';
import styles from './ChatMessageArea.module.css';
import ChatHeader from '../../ui/ChatHeader/ChatHeader';
import ChatMessage from '../../ui/ChatMessage/ChatMessage';
import MessageInput from '../../ui/MessageInput/MessageInput';

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
  const { data, isLoading, error, refetch } = useGetMessagesQuery(chatId, { skip: !chatId });
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
      <div className={styles.messageContainer}>
        <ChatHeader user={{ name: contact.name, isOnline: contact.isOnline }} />
        <div className={styles.messagesWrapper} ref={messagesWrapperRef}>
          <div className={styles.messagesList}>
            {messages.map((message, idx) => {
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
                  <ChatMessage message={message} />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.scrollbar}>
            <svg width="18" height="748" viewBox="0 0 18 748" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 15C0 13.3431 1.34315 12 3 12C4.65685 12 6 13.3431 6 15V63C6 64.6569 4.65685 66 3 66C1.34315 66 0 64.6569 0 63V15Z" fill="#E4E7EC" />
            </svg>
          </div>
        </div>
      </div>
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onTyping={handleTyping}
        isTyping={isTyping}
      />
    </div>
  );
}
