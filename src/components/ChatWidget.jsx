import { useEffect, useState, useRef } from 'react';
import { useApiClient } from '../utils/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
  const { apiFetch } = useApiClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  // Only show for admin/manager
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  const loadMessages = async () => {
    try {
      const url = selectedUserId 
        ? `/api/chat/messages?userId=${selectedUserId}`
        : '/api/chat/messages';
      const messages = await apiFetch(url);
      
      // Deduplicate messages by _id to prevent duplicates
      const uniqueMessages = (messages || []).reduce((acc, msg) => {
        const msgId = msg._id?.toString() || msg._id;
        if (!acc.find(m => (m._id?.toString() || m._id) === msgId)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      
      setAllMessages(uniqueMessages);
      
      // Calculate unread count for all conversations
      const unread = uniqueMessages.filter(m => 
        !m.isRead && m.senderRole === 'user' && (!m.receiverId || m.receiverId === null)
      ).length;
      setUnreadCount(unread);
      
      // Filter messages for selected user conversation
      if (selectedUserId) {
        const currentAdminId = user?.id || user?._id;
        const filtered = uniqueMessages.filter(m => {
          const msgSenderId = m.senderId?._id || m.senderId;
          const msgReceiverId = m.receiverId?._id || m.receiverId;
          
          // Show user's messages to admin (receiverId is null)
          if (m.senderRole === 'user' && msgSenderId === selectedUserId && (!m.receiverId || m.receiverId === null)) {
            return true;
          }
          // Show admin's messages to this specific user
          if (m.senderRole === 'admin' && msgReceiverId === selectedUserId && msgSenderId === currentAdminId) {
            return true;
          }
          return false;
        });
        setChatMessages(filtered);
      } else {
        // Don't show messages if no user is selected
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      // Silently fail - don't show error to user
    }
  };

  useEffect(() => {
    loadMessages();
    // Poll every 3 seconds for real-time (reduced frequency to prevent refresh issues)
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]); // Remove apiFetch from dependencies to prevent unnecessary re-renders

  useEffect(() => {
    if (showChatWidget && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChatWidget]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    
    try {
      await apiFetch('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({ 
          message: newMessage,
          receiverId: selectedUserId // Admin must send to specific user
        }),
      });
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      // Silently fail - don't show error to user
    }
  };

  // Group messages by user (only users who sent messages to admin)
  // Use Map to prevent duplicate entries
  const groupedMessagesMap = new Map();
  
  allMessages.forEach((msg) => {
    if (msg.senderRole === 'user' && (!msg.receiverId || msg.receiverId === null)) {
      // User message to admin (receiverId is null)
      const senderId = (msg.senderId?._id || msg.senderId)?.toString();
      if (!senderId) return;
      
      if (!groupedMessagesMap.has(senderId)) {
        groupedMessagesMap.set(senderId, {
          sender: msg.senderId,
          messages: [],
          unread: 0,
          lastMessage: null
        });
      }
      
      const conversation = groupedMessagesMap.get(senderId);
      // Check if message already exists to prevent duplicates
      const msgId = (msg._id?.toString() || msg._id);
      if (!conversation.messages.find(m => (m._id?.toString() || m._id) === msgId)) {
        conversation.messages.push(msg);
        if (!msg.isRead) {
          conversation.unread++;
        }
        // Track last message time
        if (!conversation.lastMessage || new Date(msg.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = msg;
        }
      }
    }
  });
  
  const groupedMessages = Object.fromEntries(groupedMessagesMap);

  const conversations = Object.values(groupedMessages).sort((a, b) => {
    // Sort by last message time (most recent first)
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {!showChatWidget ? (
        <button
          onClick={() => setShowChatWidget(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#3b82f6',
            border: 'none',
            color: '#ffffff',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div style={{
          width: '400px',
          height: '600px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Live Chat</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {selectedUserId ? (
                  `Chatting with ${conversations.find(c => (c.sender?._id || c.sender) === selectedUserId)?.sender?.name || 'User'}`
                ) : (
                  unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up'
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate('/dashboard/admin-chat')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Manage
              </button>
              <button
                onClick={() => {
                  setShowChatWidget(false);
                  setSelectedUserId(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* User Selection (if no user selected) */}
          {!selectedUserId && conversations.length > 0 && (
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #e5e7eb',
              maxHeight: '150px',
              overflowY: 'auto',
              background: '#f9fafb'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                Select User:
              </div>
              {conversations.map((conv) => {
                const senderId = conv.sender?._id || conv.sender;
                return (
                  <div
                    key={senderId || 'unknown'}
                    onClick={() => {
                      setSelectedUserId(senderId);
                      // Messages will be loaded via loadMessages with userId query param
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '4px',
                      background: conv.unread > 0 ? '#eff6ff' : '#ffffff',
                      border: conv.unread > 0 ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = conv.unread > 0 ? '#eff6ff' : '#ffffff'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>
                        {conv.sender?.name || 'Unknown User'}
                      </div>
                      {conv.lastMessage && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.lastMessage.message.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                    {conv.unread > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        marginLeft: '8px'
                      }}>
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected User Header */}
          {selectedUserId && (
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                  {conversations.find(c => (c.sender?._id || c.sender) === selectedUserId)?.sender?.name || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {conversations.find(c => (c.sender?._id || c.sender) === selectedUserId)?.sender?.email || ''}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setChatMessages(allMessages);
                }}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                Back
              </button>
            </div>
          )}

          {/* Messages - Only show if user is selected */}
          {selectedUserId && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f9fafb'
            }}>
              {chatMessages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                  Is user se koi messages nahi hain
                </p>
              ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: msg.senderRole === 'admin' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    background: msg.senderRole === 'admin' ? '#3b82f6' : '#e5e7eb',
                    color: msg.senderRole === 'admin' ? '#ffffff' : '#111827',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '13px'
                  }}>
                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
                      {msg.senderId?.name || 'User'} {msg.senderRole === 'admin' ? '(Admin)' : ''}
                    </div>
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSendMessage} style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px',
            background: '#ffffff'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedUserId ? "Type a message..." : "Select a user to chat"}
              disabled={!selectedUserId}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                opacity: selectedUserId ? 1 : 0.6
              }}
            />
            <button
              type="submit"
              disabled={!selectedUserId || !newMessage.trim()}
              style={{
                padding: '8px 16px',
                background: selectedUserId && newMessage.trim() ? '#3b82f6' : '#d1d5db',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: selectedUserId && newMessage.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

