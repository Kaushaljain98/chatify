import { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import NewChatModal from './NewChatModal/NewChatModal';
import ChatSummary from './ChatSummary/ChatSummary';
import './MainView.css';

function MainView() {
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryMessages, setSummaryMessages] = useState([]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (newChat) => {
    setActiveChat(newChat);
  };

  const handleShowSummary = (messages) => {
    setSummaryMessages(messages);
    setShowSummary(true);
  };

  return (
    <div className="main-view">
      <Sidebar
        onSelectChat={handleSelectChat}
        activeChat={activeChat}
        onNewChat={handleNewChat}
      />
      <ChatArea
        chat={activeChat}
        onShowSummary={handleShowSummary}
      />

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}

      {showSummary && (
        <ChatSummary
          messages={summaryMessages}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

export default MainView;
