import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { getSocket } from '../utils/socket';
import '../styles/CollaborativeEditor.css';

/**
 * CollaborativeEditor - A Google Docs-like collaborative text editor
 * 
 * This component uses Yjs (a CRDT library) to enable real-time collaborative editing.
 * Multiple users can edit the same document simultaneously, and changes are synced
 * through the backend via Socket.IO.
 * 
 * Props:
 * - documentId: The unique identifier for the document to collaborate on
 */
export default function CollaborativeEditor({ documentId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // References to maintain stable object identity across renders
  const ydocRef = useRef(null);        // Yjs document instance
  const ytextRef = useRef(null);       // Yjs shared text type
  const editorRef = useRef(null);      // DOM reference to contenteditable div
  const socketRef = useRef(null);      // Socket.IO instance
  const isUpdatingRef = useRef(false); // Flag to prevent update loops

  useEffect(() => {
    if (!documentId) {
      setError('No document ID provided');
      return;
    }

    try {
      // Get the initialized socket instance
      socketRef.current = getSocket();
      
      // Initialize a new Yjs document for this collaborative session
      ydocRef.current = new Y.Doc();
      
      // Create a shared text type named 'content' - this is what all users will collaborate on
      ytextRef.current = ydocRef.current.getText('content');

      // Join the document room on the backend
      socketRef.current.emit('doc:join', documentId);

      /**
       * Handle initial document state from the server
       * This event fires when you first join a document and contains
       * the full Yjs state encoded as a Uint8Array
       */
      socketRef.current.on('doc:init', (state) => {
        try {
          // Convert array back to Uint8Array and apply the full state to our local Yjs doc
          const stateArray = new Uint8Array(state);
          Y.applyUpdate(ydocRef.current, stateArray);
          
          // Sync the editor content with the Yjs document
          if (editorRef.current) {
            isUpdatingRef.current = true;
            editorRef.current.innerText = ytextRef.current.toString();
            isUpdatingRef.current = false;
          }
          
          setIsConnected(true);
          setError(null);
        } catch (err) {
          console.error('Error applying initial state:', err);
          setError('Failed to load document');
        }
      });

      /**
       * Handle incremental updates from other users
       * This event fires whenever another user makes a change to the document
       */
      socketRef.current.on('doc:update', (update) => {
        try {
          // Convert the update array to Uint8Array
          const updateArray = new Uint8Array(update);
          
          // Apply the update to our local Yjs document
          // Yjs handles conflict resolution automatically using CRDTs
          // Pass an origin flag so we can avoid rebroadcasting this update
          isUpdatingRef.current = true;
          Y.applyUpdate(ydocRef.current, updateArray, 'remote');
          isUpdatingRef.current = false;
        } catch (err) {
          console.error('Error applying update:', err);
        }
      });

      /**
       * Listen to local Yjs document changes
       * This fires whenever the Yjs document is updated (locally or from remote)
       * We use this to keep the editor UI in sync with the Yjs state
       */
      const updateHandler = (update, origin) => {
        // Keep the editor in sync for both local and remote updates
        // but avoid loops when we're in the middle of applying a remote update
        if (editorRef.current && (origin === 'remote' || !isUpdatingRef.current)) {
          // Save cursor position before updating content
          const selection = window.getSelection();
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          const startOffset = range ? range.startOffset : 0;
          
          // Update the editor content with the Yjs text
          editorRef.current.innerText = ytextRef.current.toString();
          
          // Restore cursor position
          if (range) {
            try {
              const newRange = document.createRange();
              const textNode = editorRef.current.firstChild || editorRef.current;
              const offset = Math.min(startOffset, textNode.textContent?.length || 0);
              newRange.setStart(textNode, offset);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } catch (err) {
              // Cursor restoration failed, ignore
            }
          }
        }

        // Send the update to the backend so other users receive it
        // Only send if this update originated from us (not from applying remote updates)
        if (socketRef.current && origin !== 'remote') {
          socketRef.current.emit('doc:update', {
            documentId,
            // Forward the incremental Yjs update produced by this change
            update: Array.from(update)
          });
        }
      };

      // Subscribe to Yjs document updates
      ydocRef.current.on('update', updateHandler);

      // Handle socket errors
      socketRef.current.on('doc:error', (errorData) => {
        console.error('Document error:', errorData);
        setError(errorData.message || 'An error occurred');
      });

      // Cleanup function - runs when component unmounts or documentId changes
      return () => {
        if (socketRef.current) {
          // Leave the document room
          socketRef.current.emit('doc:leave', documentId);
          
          // Remove all socket listeners for this document
          socketRef.current.off('doc:init');
          socketRef.current.off('doc:update');
          socketRef.current.off('doc:error');
        }

        // Destroy the Yjs document to free memory
        if (ydocRef.current) {
          ydocRef.current.off('update', updateHandler);
          ydocRef.current.destroy();
        }

        // Clear refs
        ydocRef.current = null;
        ytextRef.current = null;
        socketRef.current = null;
      };
    } catch (err) {
      console.error('Error initializing editor:', err);
      setError('Failed to initialize editor');
    }
  }, [documentId]);

  /**
   * Handle user input in the content editable div
   * This fires whenever the user types, pastes, or deletes text
   */
  const handleInput = (e) => {
    if (!ytextRef.current || isUpdatingRef.current) return;

    try {
      isUpdatingRef.current = true;
      
      // Get the current text from the editor
      const newText = e.target.innerText;
      const currentText = ytextRef.current.toString();

      // Only update if the text actually changed
      if (newText !== currentText) {
        // Delete all existing content and insert the new content
        // Yjs will handle merging this with concurrent edits from other users
        ytextRef.current.delete(0, currentText.length);
        ytextRef.current.insert(0, newText);
      }

      isUpdatingRef.current = false;
    } catch (err) {
      console.error('Error handling input:', err);
      isUpdatingRef.current = false;
    }
  };

  if (error) {
    return (
      <div className="editor-container">
        <div className="editor-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        placeholder="Start typing..."
      />
    </div>
  );
}
