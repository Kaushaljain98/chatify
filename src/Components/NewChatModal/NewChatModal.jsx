import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { IoSearchOutline, IoCheckmarkCircle } from 'react-icons/io5';
import axios from 'axios';
import './NewChatModal.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function NewChatModal({ onClose, onChatCreated }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const userId = localStorage.getItem('userId');

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${BACKEND}/chat/users`, {
        params: { search: query }
      });
      const filteredUsers = response.data.filter(user => user._id !== userId);
      setSearchResults(filteredUsers);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const participantIds = [userId, ...selectedUsers.map(u => u._id)];
      const response = await axios.post(`${BACKEND}/chat/create`, {
        participantIds
      });

      onChatCreated(response.data);
      onClose();
    } catch (err) {
      console.error('Failed to create chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some(u => u._id === userId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Chat</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="modal-search">
          <IoSearchOutline className="modal-search-icon" />
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="modal-search-input"
            autoFocus
          />
        </div>

        <div className="modal-body">
          {searching ? (
            <div className="modal-loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="user-list">
              {searchResults.map(user => {
                const selected = isUserSelected(user._id);
                return (
                  <div
                    key={user._id}
                    className={`user-item ${selected ? 'selected' : ''}`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="user-info">
                      <span className="user-name">{user.username}</span>
                      <span className="user-phone">{user.number}</span>
                    </div>
                    {selected && (
                      <IoCheckmarkCircle className="check-icon" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : searchQuery.trim() ? (
            <div className="modal-empty">No users found</div>
          ) : (
            <div className="modal-empty">
              Enter a phone number to search for users
            </div>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="modal-footer">
            <div className="selected-count">
              {selectedUsers.length} user(s) selected
            </div>
            <button
              className="start-chat-btn"
              onClick={handleCreateChat}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Start Chat'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewChatModal;
