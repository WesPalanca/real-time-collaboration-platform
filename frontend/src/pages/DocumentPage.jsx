import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../utils/socket';
import Header from '../components/Header';
import CollaborativeEditor from '../components/CollaborativeEditor';
import '../styles/DocumentPage.css';

/**
 * DocumentPage - Renders the collaborative editor for a specific document
 * 
 * This page:
 * - Extracts the documentId from the URL params
 * - Passes it to the CollaborativeEditor component for real-time collaboration
 * - Provides navigation back to the dashboard
 */
export default function DocumentPage({ user, onLogout }) {
  // Extract documentId from URL params (e.g., /documents/:documentId)
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [addUserSuccess, setAddUserSuccess] = useState(null);
  const [editors, setEditors] = useState([]);

  useEffect(() => {
    const socket = getSocket();

    // Listen for real-time editor additions and update immediately
    socket.on('doc:editor-added', (data) => {
      setEditors(data.editors);
      setAddUserSuccess('Editor added successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setAddUserSuccess(null), 3000);
    });

    socket.on('doc:error', (err) => {
      setAddUserError(err.message);
    });

    return () => {
      socket.off('doc:editor-added');
      socket.off('doc:error');
    };
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!recipientId.trim()) {
      setAddUserError('Please enter a user ID');
      return;
    }

    try {
      setAddingUser(true);
      setAddUserError(null);
      setAddUserSuccess(null);

      // Emit socket event for real-time editor addition
      const socket = getSocket();
      socket.emit('doc:add-editor', { 
        documentId, 
        recipientId: recipientId.trim() 
      });

      setRecipientId('');
    } catch (err) {
      setAddUserError('Failed to add editor');
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div className="document-page">
      <Header user={user} onLogout={onLogout} />
      
      <div className="document-container">
        <div className="document-toolbar">
          <button onClick={handleBackToDashboard} className="btn-back">
            ← Back to Dashboard
          </button>
          <div className="document-info">
            <span className="document-id">Document: {documentId}</span>
          </div>
          <form onSubmit={handleAddUser} className="document-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter user ID to add..."
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                disabled={addingUser}
                className="document-input"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={addingUser || !recipientId.trim()}
                className="btn-primary"
              >
                {addingUser ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>

        {/* Add-user feedback and updated editors list */}
        {addUserError && <div className="error-message">{addUserError}</div>}
        {addUserSuccess && <div className="document-info">{addUserSuccess}</div>}
        {editors.length > 0 && (
          <div className="document-info">
            Editors: {editors.join(', ')}
          </div>
        )}

        {/* Collaborative editor component - handles all real-time sync */}
        <div className="editor-wrapper">
          <CollaborativeEditor documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
