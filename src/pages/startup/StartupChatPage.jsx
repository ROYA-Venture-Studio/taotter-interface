import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useGetChatListQuery, useGetMessagesQuery, useSendMessageMutation } from "../../store/api/chatApi";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageInput from "../../components/chat/MessageInput";
import VoiceRecorder from "../../components/chat/VoiceRecorder";
import ChatList from "../../components/chat/ChatList";
import useSocket from "../../hooks/useSocket";
import "./StartupChatPage.css";

export default function StartupChatPage() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const currentUser = useSelector(state => state.auth.user);

  // Fetch chat list and messages
  const { data: chatListData } = useGetChatListQuery();
  const { data, isLoading, error, refetch } = useGetMessagesQuery(
    chatId ? { chatId, page: 1, pageSize: 50 } : undefined,
    { skip: !chatId }
  );
  const [sendMessage] = useSendMessageMutation();
  const socketApi = useSocket({
    onMessage: msg => {
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
      // Ownership logic: isOwn true if senderType is "startup"
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
        return [...prev, newMsg];
      });
    }
  });

  // Find current chat and contact info
  const validChats = chatListData?.data?.chats || [];
  const currentChat = validChats.find(chat => chat._id === chatId);
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

  // Transform messages from API and merge with pending optimistic messages
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
          isOwn: msg.senderType === "startup"
        };
      });

      setMessages(prev => {
        // Remove any pending optimistic messages that match a backend message by content and createdAt (within 5 seconds)
        const filteredOptimistic = prev.filter(
          m =>
            m.pending &&
            !backendMessages.some(
              b =>
                b.content === m.content &&
                Math.abs(new Date(b.createdAt) - new Date(m.createdAt)) < 5000
            )
        );
        // Merge backend messages with any remaining optimistic messages
        return [...backendMessages, ...filteredOptimistic];
      });
    }
  }, [data]);

  // Websocket integration for real-time messages
  useEffect(() => {
    if (!socketApi || !chatId) return;
    socketApi.joinConversation(chatId);

    return () => {
      socketApi.leaveConversation(chatId);
    };
  }, [socketApi, chatId]);

  // Handle sending a message
  const handleSend = async (msg, file, duration) => {
    if (!chatId) return;
    // Optimistically add outgoing message with tempId and mark as pending
    let tempId = "temp-" + Date.now();
    let optimisticMsg = null;
    if (msg || file || voiceBlob) {
      optimisticMsg = {
        id: tempId,
        tempId,
        user: { name: "Me", avatar: "/assets/icons/User.svg", isOnline: true },
        content: msg || (file ? "[Attachment]" : "") || "",
        messageType: file ? "file" : (voiceBlob ? "voice" : "text"),
        fileUrl: file ? URL.createObjectURL(file) : null,
        imageUrl: null,
        fileName: file ? file.name : "",
        voiceUrl: voiceBlob ? URL.createObjectURL(voiceBlob) : null,
        voiceDuration: voiceBlob ? voiceDuration : duration,
        createdAt: new Date().toISOString(),
        isOwn: true,
        pending: true
      };
      setMessages(prev => [...prev, optimisticMsg]);
    }
    try {
      let backendMsg;
      if (voiceBlob) {
        backendMsg = await sendMessage({ chatId, content: "", file: voiceBlob, voiceDuration }).unwrap();
        setVoiceBlob(null);
        setVoiceDuration(null);
      } else {
        backendMsg = await sendMessage({ chatId, content: msg, file, voiceDuration: duration }).unwrap();
      }
      setInput("");
      // Replace optimistic message with backend message in-place
      if (backendMsg && backendMsg.data && backendMsg.data.message) {
        const realMsg = backendMsg.data.message;
        setMessages(prev =>
          prev.map(m =>
            m.tempId === tempId
              ? {
                  ...m,
                  ...{
                    id: realMsg._id,
                    tempId: undefined,
                    content: realMsg.content,
                    messageType: realMsg.messageType || m.messageType,
                    fileUrl: realMsg.fileUrl || m.fileUrl,
                    imageUrl: realMsg.imageUrl || m.imageUrl,
                    fileName: realMsg.fileName || m.fileName,
                    voiceUrl: realMsg.voiceUrl || m.voiceUrl,
                    voiceDuration: realMsg.voiceDuration || m.voiceDuration,
                    createdAt: realMsg.createdAt || m.createdAt,
                    isOwn: true,
                    pending: false
                  }
                }
              : m
          )
        );
      }
      refetch();
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const handleRecordComplete = (blob, duration) => {
    setVoiceBlob(blob);
    setVoiceDuration(duration);
  };

  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  // Always scroll chat area to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle mobile navigation - open chat if chatId exists
  useEffect(() => {
    if (chatId) {
      setIsMobileChatOpen(true);
    } else {
      setIsMobileChatOpen(false);
    }
  }, [chatId]);

  return (
    <div className="startup-chat-page">
      <div className={`startup-chat-main ${isMobileChatOpen ? 'mobile-chat-open' : ''}`}>
        {/* Chat List Sidebar */}
        <aside className="startup-chat-list">
          <ChatList onChatSelect={(selectedChatId) => {
            setIsMobileChatOpen(true);
          }} />
        </aside>

        {/* Chat Message Area */}
        <div className="startup-chat-message-area">
          {chatId && contact ? (
            <>
              <div className="startup-chat-header">
                <button 
                  className="startup-chat-header-back" 
                  onClick={() => setIsMobileChatOpen(false)}
                  aria-label="Back to chat list"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="startup-chat-header-contact">
                  <div className="startup-chat-header-avatar">
                    <img src={contact.avatar} alt={contact.name} />
                    <span className={`startup-chat-header-status ${contact.isOnline ? "online" : "offline"}`} />
                  </div>
                  <span className="startup-chat-header-name">{contact.name}</span>
                </div>
                <button className="startup-chat-header-menu" aria-label="Menu">
                  <svg width="4" height="16" fill="none" viewBox="0 0 4 16">
                    <path d="M2.18262 12.2588C3.06529 12.3482 3.75391 13.0937 3.75391 14C3.75391 14.9063 3.06529 15.6518 2.18262 15.7412L2.00391 15.75H1.99414C1.02764 15.75 0.244141 14.9665 0.244141 14C0.244141 13.0335 1.02764 12.25 1.99414 12.25H2.00391L2.18262 12.2588ZM2.18262 6.25879C3.06529 6.34819 3.75391 7.09375 3.75391 8C3.75391 8.90625 3.06529 9.65181 2.18262 9.74121L2.00391 9.75H1.99414C1.02764 9.75 0.244141 8.9665 0.244141 8C0.244141 7.0335 1.02764 6.25 1.99414 6.25H2.00391L2.18262 6.25879ZM2.18262 0.258789C3.06529 0.348189 3.75391 1.09375 3.75391 2C3.75391 2.90625 3.06529 3.65181 2.18262 3.74121L2.00391 3.75H1.99414C1.02764 3.75 0.244141 2.9665 0.244141 2C0.244141 1.0335 1.02764 0.25 1.99414 0.25H2.00391L2.18262 0.258789Z" fill="#344054" />
                  </svg>
                </button>
              </div>
              <div className="startup-chat-messages" ref={chatAreaRef}>
                {isLoading ? (
                  <div className="startup-chat-loading">Loading messages...</div>
                ) : error ? (
                  <div className="startup-chat-error">Failed to load messages</div>
                ) : (
                  messages.map((message, idx) => (
                    <MessageBubble key={message.id || idx} message={message} isOwn={message.isOwn} />
                  ))
                )}
                {isTyping && <div className="startup-chat-typing">Typing...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="startup-chat-input-row">
                <div style={{ flex: 1 }}>
                  <MessageInput
                    chatId={contact.id}
                    forceSendEnabled={true}
                    content={input}
                    onChange={e => setInput(e.target.value)}
                    onSend={handleSend}
                    showMic={false}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <VoiceRecorder
                    onRecordComplete={handleRecordComplete}
                    disabled={false}
                    voiceBlob={voiceBlob}
                    voiceDuration={voiceDuration}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="startup-chat-empty-state">
              <h2>Select a chat to start messaging</h2>
              <p>Choose a contact from the list to view and send messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
