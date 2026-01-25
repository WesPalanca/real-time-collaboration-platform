import { useParams, useNavigate } from 'react-router-dom';
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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
        </div>

        {/* Collaborative editor component - handles all real-time sync */}
        <div className="editor-wrapper">
          <CollaborativeEditor documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
