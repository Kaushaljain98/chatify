import { useState, useEffect } from 'react';
import { IoChatbubbleEllipsesOutline, IoAddOutline, IoSearchOutline } from 'react-icons/io5';
import { BiMessageSquareDetail, BiArchive, BiStar, BiCog } from 'react-icons/bi';
import axios from 'axios';
import './Sidebar.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function Sidebar({ onSelectChat, activeChat, onNewChat }) {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchChats();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter(chat => {
        const otherUser = chat.participants?.find(
          p => p._id !== localStorage.getItem('userId')
        );
        return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const fetchChats = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${BACKEND}/chat/user-chats/${userId}`);
      setChats(response.data);
      setFilteredChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${BACKEND}/user/profile/${userId}`);
      setUserProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants?.find(
      p => p._id !== localStorage.getItem('userId')
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getLastMessage = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const text = chat.lastMessage.text || 'Image';
    return text.length > 35 ? text.substring(0, 35) + '...' : text;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          {userProfile?.profileImage ? (
            <img src={userProfile.profileImage} alt="User" className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">
              {userProfile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="sidebar-title">Chatify</span>
        </div>
        <button className="compose-btn" onClick={onNewChat}>
          <IoAddOutline />
        </button>
      </div>

      <div className="sidebar-search">
        <IoSearchOutline className="search-icon" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chats">
            <IoChatbubbleEllipsesOutline className="empty-icon" />
            <p className="empty-text">No chats yet</p>
            <p className="empty-subtext">Start a new conversation</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const otherUser = getOtherUser(chat);
            const isActive = activeChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                {otherUser?.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.username}
                    className="chat-avatar"
                  />
                ) : (
                  <div className="chat-avatar-placeholder">
                    {otherUser?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}

                <div className="chat-info">
                  <div className="chat-header-row">
                    <span className="chat-name">{otherUser?.username || 'Unknown'}</span>
                    {chat.lastMessage && (
                      <span className="chat-time">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="chat-last-message">{getLastMessage(chat)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn active">
          <BiMessageSquareDetail />
        </button>
        <button className="footer-btn">
          <BiArchive />
        </button>
        <button className="footer-btn">
          <BiStar />
        </button>
        <button className="footer-btn">
          <BiCog />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
