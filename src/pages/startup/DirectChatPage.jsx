import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetChatListQuery, useGetMessagesQuery, useSendMessageMutation, useCreateChatMutation } from "../../store/api/chatApi";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageInput from "../../components/chat/MessageInput";
import useSocket from "../../hooks/useSocket";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./DirectChatPage.css";

export default function DirectChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const currentUser = useSelector(state => state.auth.user);
  const messagesEndRef = useRef(null);

  // API hooks
  const { data: chatListData, refetch: refetchChatList } = useGetChatListQuery();
  const { data, isLoading, error, refetch } = useGetMessagesQuery(
    chatId ? { chatId, page: 1, pageSize: 50 } : undefined,
    { skip: !chatId }
  );
  const [sendMessage] = useSendMessageMutation();
  const [createChat] = useCreateChatMutation();

  // Socket connection for real-time messages
  const socketApi = useSocket({
    onMessage: msg => {
      console.log('DirectChat received socket message:', msg);
      
      let imageUrl = null;
      let fileUrl = null;
      let voiceUrl = null;
      let messageType = msg.messageType || "text";
      
      if (messageType === "image" && msg.fileUrl) {
        imageUrl = msg.fileUrl;
      } else if (messageType === "file" && msg.fileUrl) {
        fileUrl = msg.fileUrl;
      } else if (messageType === "voice" && msg.fileUrl) {
        voiceUrl = msg.fileUrl;
      }
      
      // CRITICAL: Ownership logic - isOwn true if senderType is "startup"
      const isOwn = msg.senderType === "startup";
      
      const newMsg = {
        id: msg._id,
        user: msg.senderType === "admin"
          ? { name: "Admin", avatar: "/assets/icons/User.svg", isOnline: true }
          : { name: "Me", avatar: "/assets/icons/User.svg", isOnline: true },
        content: msg.content || "",
        messageType,
        fileUrl,
        imageUrl,
        fileName: msg.fileName || "",
        voiceUrl,
        voiceDuration: msg.voiceDuration,
        createdAt: msg.createdAt,
        isOwn
      };
      
      setMessages(prev => {
        // Deduplicate: don't add if already present by id or (content+createdAt within 5s)
        const exists = prev.some(
          m =>
            (m.id && m.id === newMsg.id) ||
            (
              m.content === newMsg.content &&
              Math.abs(new Date(m.createdAt) - new Date(newMsg.createdAt)) < 5000
            )
        );
        if (exists) return prev;
        console.log('Adding new socket message:', newMsg);
        return [...prev, newMsg];
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find or create chat with admin on component mount
  useEffect(() => {
    const findOrCreateChat = async () => {
      if (chatListData?.data?.chats?.length > 0) {
        // Use existing chat if available
        const existingChat = chatListData.data.chats[0]; // Take the first chat (should be with admin)
        console.log('Using existing chat:', existingChat._id);
        setChatId(existingChat._id);
      } else {
        // Create new chat with admin
        try {
          setIsCreatingChat(true);
          const result = await createChat({
            adminEmail: "admin@leansprintr.com",
            message: "Hello! I'd like to discuss my project."
          }).unwrap();
          
          if (result.success && result.data?.chat?._id) {
            console.log('Created new chat:', result.data.chat._id);
            setChatId(result.data.chat._id);
            refetchChatList(); // Refresh chat list
          }
        } catch (error) {
          console.error("Failed to create chat:", error);
        } finally {
          setIsCreatingChat(false);
        }
      }
    };

    findOrCreateChat();
  }, [chatListData, createChat, refetchChatList]);

  // Join socket room when chatId is available
  useEffect(() => {
    if (chatId && socketApi.joinConversation) {
      console.log('Joining socket conversation:', chatId);
      socketApi.joinConversation(chatId);
      
      // Cleanup: leave conversation when component unmounts or chatId changes
      return () => {
        if (socketApi.leaveConversation) {
          console.log('Leaving socket conversation:', chatId);
          socketApi.leaveConversation(chatId);
        }
      };
    }
  }, [chatId, socketApi]);

  // Transform messages from API
  useEffect(() => {
    if (data && data.data && data.data.messages) {
      const backendMessages = data.data.messages.map(msg => {
        let imageUrl = null;
        let fileUrl = null;
        let voiceUrl = null;
        let messageType = msg.messageType || "text";
        
        if (messageType === "image" && msg.fileUrl) {
          imageUrl = msg.fileUrl;
        } else if (messageType === "file" && msg.fileUrl) {
          fileUrl = msg.fileUrl;
        } else if (messageType === "voice" && msg.fileUrl) {
          voiceUrl = msg.fileUrl;
        }

        // CRITICAL: Ownership logic - isOwn true if senderType is "startup"
        const isOwn = msg.senderType === "startup";
        
        return {
          id: msg._id,
          user: msg.senderType === "admin"
            ? { name: "Admin", avatar: "/assets/icons/User.svg", isOnline: true }
            : { name: "Me", avatar: "/assets/icons/User.svg", isOnline: true },
          content: msg.content || "",
          messageType,
          fileUrl,
          imageUrl,
          fileName: msg.fileName || "",
          voiceUrl,
          voiceDuration: msg.voiceDuration,
          createdAt: msg.createdAt,
          isOwn
        };
      });
      
      console.log('Setting backend messages:', backendMessages);
      setMessages(backendMessages);
    }
  }, [data]);

  const handleSendMessage = async (content, messageType = "text", file = null, voiceDuration = null) => {
    if (!chatId || (!content.trim() && !file)) return;

    const tempId = Date.now().toString();
    const timestamp = new Date().toISOString();

    // Add optimistic message for user's own message (isOwn = true)
    if (messageType === "text" || messageType === "voice" || messageType === "image" || messageType === "file") {
      const optimisticMessage = {
        id: tempId,
        user: { name: "Me", avatar: "/assets/icons/User.svg", isOnline: true },
        content: content || "",
        messageType,
        fileUrl: file && messageType === "file" ? URL.createObjectURL(file) : null,
        imageUrl: file && messageType === "image" ? URL.createObjectURL(file) : null,
        voiceUrl: file && messageType === "voice" ? URL.createObjectURL(file) : null,
        fileName: file ? file.name : "",
        voiceDuration: voiceDuration,
        createdAt: timestamp,
        isOwn: true // User's own message - goes on the right
      };
      
      console.log('Adding optimistic message:', optimisticMessage);
      setMessages(prev => [...prev, optimisticMessage]);
    }

    try {
      // Use the same format as StartupChatPage
      const result = await sendMessage({ 
        chatId, 
        content, 
        file, 
        voiceDuration 
      }).unwrap();
      
      console.log('Message sent successfully:', result);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const contact = {
    id: "admin",
    name: "Leansprintr Team",
    avatar: "/assets/icons/User.svg",
    isOnline: true
  };

  if (isCreatingChat) {
    return (
      <div className="direct-chat-page">
        <div className="direct-chat-header">
          <img src={leanSprintLogo} alt="Leansprintr" className="direct-chat-logo" />
        </div>
        <div className="direct-chat-loading">
          <div className="loading-spinner"></div>
          <p>Starting conversation with our team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="direct-chat-page">
      {/* Header */}
      <div className="direct-chat-header">
        <img src={leanSprintLogo} alt="Leansprintr" className="direct-chat-logo" />
      </div>

      {/* Chat Container */}
      <div className="direct-chat-container">
        <div className="direct-chat-message-area">
          {/* Contact Header */}
          <div className="direct-chat-contact-header">
            <div className="contact-info">
              <div className="contact-avatar">
                <img src={contact.avatar} alt={contact.name} />
                <div className={`contact-status ${contact.isOnline ? 'online' : 'offline'}`}></div>
              </div>
              <div className="contact-details">
                <h3 className="contact-name">{contact.name}</h3>
                <p className="contact-status-text">
                  {contact.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="direct-chat-messages">
            {messages.length === 0 && !isLoading && (
              <div className="no-messages">
                <p>👋 Start a conversation with our team!</p>
                <p>We're here to help with your project.</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="messages-loading">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
              </div>
            ) : (
              messages.map((message) => {
                console.log('Rendering message:', message.id, 'isOwn:', message.isOwn, 'content:', message.content);
                return (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isOwn={message.isOwn} 
                  />
                );
              })
            )}
            
            {isTyping && (
              <div className="typing-indicator">
                <span>Admin is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="direct-chat-input-area">
            <MessageInput
              chatId={chatId}
              content={input}
              onChange={(e) => setInput(e.target.value)}
              onSend={(content, file, voiceDuration) => {
                if (file) {
                  const messageType = file.type.startsWith('image/') ? 'image' : 
                                   file.type.startsWith('audio/') ? 'voice' : 'file';
                  handleSendMessage("", messageType, file, voiceDuration);
                } else {
                  handleSendMessage(content);
                }
              }}
              disabled={!chatId}
              showMic={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}