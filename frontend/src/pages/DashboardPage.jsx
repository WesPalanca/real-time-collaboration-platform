import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, roomAPI, documentAPI } from '../utils/api';
import { initSocket } from '../utils/socket';
import Header from '../components/Header';
import RoomForm from '../components/RoomForm';
import RoomList from '../components/RoomList';
import '../styles/DashboardPage.css';

export default function DashboardPage({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Documents list state
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  
  // Document creation state
  const [documentTitle, setDocumentTitle] = useState('');
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket
    const token = localStorage.getItem('token');
    initSocket(token);

    // Fetch rooms
    fetchRooms();

    // Fetch documents created by the current user
    fetchDocuments();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getRooms();
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms([...rooms, newRoom]);
  };

  /**
   * Fetch documents created by the current user
   * - Calls GET /documents?ownerId=<userId>
   * - Stores results and handles loading/error state
   */
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const res = await documentAPI.getDocuments();
      setDocuments(res.data.docs || res.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setDocumentsError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  /**
   * Handle document creation
   * - Validates that a title was entered
   * - Sends POST request to /documents endpoint with the title
   * - Navigates to DocumentPage with the created document ID on success
   * - Handles loading and error states appropriately
   */
  const handleCreateDocument = async (e) => {
    e.preventDefault();
    
    // Validate title input
    if (!documentTitle.trim()) {
      setDocumentError('Please enter a document title');
      return;
    }

    try {
      setCreatingDocument(true);
      setDocumentError(null);
      
      // Create document via API - POST /documents with title in request body
      const response = await documentAPI.createDocument(documentTitle.trim());
      
      // Extract document ID from API response
      const documentId = response.data.document._id || response.data.document.id;
      
      // Navigate to DocumentPage, passing documentId via URL params
      navigate(`/documents/${documentId}`);
      
    } catch (err) {
      console.error('Failed to create document:', err);
      setDocumentError(err.response?.data?.message || 'Failed to create document');
    } finally {
      setCreatingDocument(false);
    }
  };

  /**
   * Reset the document creation form
   */
  const handleCancelDocument = () => {
    setDocumentTitle('');
    setDocumentError(null);
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Document creation section - prompts user for title and creates document */}
          <section className="create-document-section">
            <h2>Create a New Document</h2>
            <form onSubmit={handleCreateDocument} className="document-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter document title..."
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  disabled={creatingDocument}
                  className="document-input"
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={creatingDocument || !documentTitle.trim()}
                  className="btn-primary"
                >
                  {creatingDocument ? 'Creating...' : 'Create Document'}
                </button>
                
                {documentTitle && (
                  <button
                    type="button"
                    onClick={handleCancelDocument}
                    disabled={creatingDocument}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {/* Display error if document creation fails */}
              {documentError && (
                <div className="error-message">
                  {documentError}
                </div>
              )}
            </form>
          </section>

          <section className="create-room-section">
            <h2>Create a New Room</h2>
            <RoomForm onRoomCreated={handleRoomCreated} />
          </section>

          {/* Documents list section - renders user documents and navigates on click */}
          <section className="rooms-section">
            <h2>Your Documents</h2>

            {/* Loading and error states for fetching documents */}
            {documentsLoading && <p>Loading documents...</p>}
            {documentsError && <p className="error-message">{documentsError}</p>}

            {/* Render document list */}
            {!documentsLoading && !documentsError && (
              <ul className="document-list">
                {documents.length === 0 && <li>No documents yet.</li>}
                {documents.map((doc) => (
                  <li
                    key={doc._id || doc.id}
                    className="document-item"
                    onClick={() => navigate(`/documents/${doc._id || doc.id}`)}
                  >
                    <span className="document-title">{doc.title || 'Untitled Document'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rooms-section">
            <RoomList rooms={rooms} loading={loading} />
          </section>
        </div>
      </div>
    </div>
  );
}
