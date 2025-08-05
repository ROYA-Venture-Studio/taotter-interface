import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import AdminChatList from "../../components/admin/AdminChatList";
import AdminChatArea from "../../components/admin/AdminChatArea";
import { useGetChatListQuery, useGetMessagesQuery, useSendMessageMutation } from "../../store/api/chatApi";
import { useSelector } from "react-redux";
import useSocket from "../../hooks/useSocket";
import "./AdminChatPage.css";

export default function AdminChatPage() {
  let { id: chatId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Get current user info
  const currentUser = useSelector(state => state.auth.user);

  // Fetch chat list to get contact info
  const { data: chatListData } = useGetChatListQuery();

  // Find current chat and contact info
  const validChats = chatListData?.data?.chats || [];
  const isValidChatId = validChats.some(chat => chat._id === chatId);
  const currentChat = validChats.find(chat => chat._id === chatId);

  // Fetch messages for the selected chat
  const { data, isLoading, error, refetch } = useGetMessagesQuery(
    { chatId, page: 1, pageSize: 50 },
    { skip: !chatId }
  );

  // Send message mutation
  const [sendMessage] = useSendMessageMutation();
  const contact = currentChat?.startupId ? {
    id: currentChat._id,
    name: `${currentChat.startupId.profile?.founderFirstName || ""} ${currentChat.startupId.profile?.founderLastName || ""}`.trim() || currentChat.startupId.email,
    avatar: "/assets/icons/User.svg",
    status: "online", // TODO: Replace with real status
    role: currentChat.startupId.profile?.companyName || ""
  } : null;

  // Real-time socket integration
  const socket = useSocket({
    onMessage: (msg) => {
      if (msg.conversationId === chatId) {
        setMessages(prev => [...prev, msg]);
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
    // eslint-disable-next-line
  }, [chatId]);

  // Load messages from API and transform them
  useEffect(() => {
    if (data && data.data && data.data.messages) {
      const transformedMessages = data.data.messages.map(msg => {
        const isMyMessage = msg.senderType === 'admin' && (currentUser?.role === 'admin' || currentUser?.role === 'super_admin');
        let messageType = "text";
        let imageUrl = null;
        let voiceUrl = null;
        const fileUrl = msg.fileUrl || msg.file || null;
        if (msg.messageType === "image" && fileUrl) {
          imageUrl = fileUrl;
          messageType = "image";
        } else if (msg.messageType === "voice" && fileUrl) {
          voiceUrl = fileUrl;
          messageType = "voice";
        } else if (msg.messageType === "file" && fileUrl) {
          messageType = "file";
        } else {
          messageType = "text";
        }
        return {
          id: msg._id,
          sender: msg.senderType === 'admin' ? 'Admin' : (contact?.name || "Unknown"),
          avatar: msg.senderType === 'admin' ? "/assets/icons/User.svg" : (contact?.avatar || "/assets/icons/User.svg"),
          content: msg.content || "",
          time: new Date(msg.createdAt).toLocaleTimeString(),
          mine: isMyMessage,
          imageUrl,
          messageType,
          fileUrl: fileUrl,
          fileName: msg.fileName || null,
          mimeType: msg.mimeType || null,
          voiceUrl,
          voiceDuration: msg.voiceDuration || null,
          createdAt: msg.createdAt
        };
      });
      setMessages(transformedMessages);
    }
  }, [data, contact?.name, contact?.avatar, currentUser]);

  // Handle sending a message
  const handleSend = useCallback(
    async (msg, file, voiceDuration) => {
      if (!chatId) {
        alert("Cannot send message: Invalid chat selected");
        return;
      }
      try {
        await sendMessage({ chatId, content: msg, file, voiceDuration }).unwrap();
        setInput("");
      } catch (err) {
        alert("Failed to send message");
      }
    },
    [chatId, sendMessage]
  );

  // Typing indicator
  const handleTyping = useCallback(
    (typing) => {
      socket.sendTyping && socket.sendTyping(chatId, typing);
    },
    [chatId, socket]
  );

  return (
    <AdminLayout>
      <div className="admin-chat-page">
        <div className="admin-chat-breadcrumb">
          <Breadcrumb
            items={[
              { label: "Home", href: "/admin/dashboard" },
              { label: "Chat", href: "/admin/chat", isActive: true }
            ]}
          />
        </div>
        <div className="admin-chat-main">
          <AdminChatList
            selectedId={chatId}
            onSelect={contactId => navigate(`/admin/chat/${contactId}`)}
            search={search}
            onSearchChange={setSearch}
          />
          <div className="admin-chat-message-area">
            {chatId && contact ? (
              <AdminChatArea
                contact={contact}
                messages={messages}
                value={input}
                onChange={e => setInput(e.target.value)}
                onSend={handleSend}
                onAttach={file => handleSend("", file)}
                onMic={() => {}}
                onEmoji={() => {}}
                isTyping={isTyping}
                onTyping={handleTyping}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <div className="admin-chat-empty-state">
                <h2>Select a chat to start messaging</h2>
                <p>Choose a contact from the list to view and send messages.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
