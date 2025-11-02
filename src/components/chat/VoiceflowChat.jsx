import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './VoiceflowChat.css';

const VoiceflowChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const token = useSelector((state) => state.auth.token);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load chat history when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/voiceflow-chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await axios.post(
        `${API_URL}/api/voiceflow-chat`,
        { message: userMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Add assistant response
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Refocus the input after sending message
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="voiceflow-chat-widget">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          className="voiceflow-chat-button"
          onClick={toggleChat}
          aria-label="Open Startup Coach Chat"
        >
          <span className="chat-icon">💬</span>
          <span className="chat-label">Startup Coach</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="voiceflow-chat-window">
          {/* Header */}
          <div className="voiceflow-chat-header">
            <div className="header-content">
              <span className="header-icon">🚀</span>
              <div className="header-text">
                <h3>Startup Coach</h3>
                <p>AI-powered guidance for your startup journey</p>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="voiceflow-chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! I'm your Startup Coach.</p>
                <p>Ask me anything about building your startup, fundraising, product development, or scaling your business!</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role}`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="voiceflow-chat-input" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
            >
              <span>➤</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VoiceflowChat;
