import { useEffect, useState, useRef } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const AdminChat = () => {
  const { apiFetch } = useApiClient();
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  // Load all messages for conversations list (always load all)
  const loadAllMessages = async () => {
    try {
      setError('');
      const messages = await apiFetch('/api/chat/messages');
      
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
    } catch (err) {
      console.error('Error loading all messages:', err);
      setError('');
    }
  };

  // Load messages for selected conversation
  const loadConversationMessages = async (userId) => {
    if (!userId) {
      setChatMessages([]);
      return;
    }
    
    try {
      setError('');
      const messages = await apiFetch(`/api/chat/messages?userId=${userId}`);
      
      // Deduplicate messages
      const uniqueMessages = (messages || []).reduce((acc, msg) => {
        const msgId = msg._id?.toString() || msg._id;
        if (!acc.find(m => (m._id?.toString() || m._id) === msgId)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      
      setChatMessages(uniqueMessages);
    } catch (err) {
      console.error('Error loading conversation messages:', err);
      setError('');
    }
  };

  // Combined load function
  const loadMessages = async () => {
    // Always load all messages for conversations list
    await loadAllMessages();
    
    // If user is selected, also load their conversation
    if (selectedUserId) {
      await loadConversationMessages(selectedUserId);
    } else {
      setChatMessages([]);
    }
  };

  useEffect(() => {
    // Initial load - get all messages for conversations list
    loadAllMessages();
    
    // Poll every 3 seconds for real-time
    const interval = setInterval(() => {
      loadAllMessages();
      // If user is selected, also refresh their conversation
      if (selectedUserId) {
        loadConversationMessages(selectedUserId);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  // Load conversation when user is selected
  useEffect(() => {
    if (selectedUserId) {
      loadConversationMessages(selectedUserId);
    } else {
      setChatMessages([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    
    setError('');
    try {
      await apiFetch('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({ 
          message: newMessage,
          receiverId: selectedUserId // Required: admin must send to specific user
        }),
      });
      setNewMessage('');
      // Refresh both all messages and current conversation
      await loadAllMessages();
      if (selectedUserId) {
        await loadConversationMessages(selectedUserId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  const handleMarkAsRead = async (conversationUserId = null) => {
    try {
      setError('');
      await apiFetch('/api/chat/mark-read', {
        method: 'PUT',
        body: JSON.stringify({
          conversationUserId: conversationUserId || selectedUserId
        }),
      });
      // Refresh both all messages and current conversation
      await loadAllMessages();
      if (selectedUserId) {
        await loadConversationMessages(selectedUserId);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
      setError('');
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
    <div className="dashboard">
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
        {/* Conversations List */}
        <div style={{
          width: '300px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Conversations</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAsRead}
                style={{
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Mark All Read
              </button>
            )}
          </div>
          {conversations.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
              Koi conversations nahi hain
            </p>
          ) : (
            conversations.map((conv) => {
              const senderId = conv.sender?._id || conv.sender;
              const isSelected = selectedUserId === senderId;
              return (
              <div
                key={senderId || 'unknown'}
                onClick={async () => {
                  setSelectedUserId(senderId);
                  // Load conversation messages for selected user
                  await loadConversationMessages(senderId);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: isSelected ? '#dbeafe' : (conv.unread > 0 ? '#eff6ff' : '#f9fafb'),
                  border: isSelected ? '2px solid #3b82f6' : (conv.unread > 0 ? '1px solid #3b82f6' : '1px solid #e5e7eb'),
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                      {conv.sender?.name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {conv.sender?.email || ''}
                    </div>
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
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {conv.lastMessage && (
                    <div style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}>
                      {conv.lastMessage.message.substring(0, 40)}
                      {conv.lastMessage.message.length > 40 ? '...' : ''}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                    {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {selectedUserId ? (
                `Chat with ${conversations.find(c => (c.sender?._id || c.sender) === selectedUserId)?.sender?.name || 'User'}`
              ) : (
                'Live Chat Management'
              )}
            </h2>
            {selectedUserId && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleMarkAsRead(selectedUserId)}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#ffffff'
                  }}
                >
                  Mark Read
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setChatMessages([]);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  Back
                </button>
              </div>
            )}
          </div>
          
          {error && <p className="error-text">{error}</p>}

          {/* Messages Display */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {chatMessages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                {selectedUserId ? 'Is user se koi messages nahi hain' : 'Koi messages nahi hain'}
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
                    maxWidth: '70%',
                    background: msg.senderRole === 'admin' ? '#3b82f6' : '#e5e7eb',
                    color: msg.senderRole === 'admin' ? '#ffffff' : '#111827',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: !msg.isRead && msg.senderRole === 'user' ? '2px solid #ef4444' : 'none'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', fontWeight: 500 }}>
                      {msg.senderId?.name || 'User'} 
                      {msg.senderRole === 'admin' ? ' (Admin)' : ' (User)'}
                      {!msg.isRead && msg.senderRole === 'user' && (
                        <span style={{ marginLeft: '8px', color: '#ef4444' }}>● Unread</span>
                      )}
                    </div>
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '6px' }}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          {selectedUserId ? (
            <form onSubmit={handleSendMessage} style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="primary-btn"
                style={{ padding: '12px 24px' }}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          ) : (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280',
              borderTop: '1px solid #e5e7eb'
            }}>
              Please select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

