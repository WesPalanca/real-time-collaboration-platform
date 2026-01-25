import * as Y from 'yjs';
import Document from '../models/document.model.js';
import log from '../utils/log.js';

const docs = new Map(); 

// Debounced save - only save if doc was modified
const pendingSaves = new Map();
const SAVE_DELAY = 2000; // 2 seconds

const scheduleSave = (docId, ydoc) => {
    if (pendingSaves.has(docId)) {
        clearTimeout(pendingSaves.get(docId));
    }
    
    const timeout = setTimeout(async () => {
        try {
            const yText = ydoc.getText('content');
            await Document.findByIdAndUpdate(docId, {
                yjsState: Buffer.from(Y.encodeStateAsUpdate(ydoc)),
                content: yText ? yText.toString() : '',
                lastUpdatedAt: new Date(),
            });
            pendingSaves.delete(docId);
            log('INFO', `Saved document ${docId}`);
        } catch (err) {
            log('ERROR', `Error saving doc ${docId}`, err);
        }
    }, SAVE_DELAY);
    
    pendingSaves.set(docId, timeout);
};

const registerDocumentHandlers = (io, socket) => {
    socket.on('doc:join', async (documentId) => {
        try {
            let ydoc = docs.get(documentId);
            
            if (!ydoc) {
                ydoc = new Y.Doc();
                
                const dbDoc = await Document.findById(documentId);
                if (dbDoc && dbDoc.yjsState) {
                    const state = Buffer.isBuffer(dbDoc.yjsState) 
                        ? new Uint8Array(dbDoc.yjsState) 
                        : dbDoc.yjsState;
                    Y.applyUpdate(ydoc, state);
                }
                
                // Save on every update (debounced)
                ydoc.on('update', () => {
                    scheduleSave(documentId, ydoc);
                });
                
                docs.set(documentId, ydoc);
            }

            socket.join(documentId);

            // Send full doc state to new client
            const state = Y.encodeStateAsUpdate(ydoc);
            socket.emit('doc:init', Array.from(state));
            
            log('INFO', `Socket ${socket.id} joined document ${documentId}`);
            
        } catch (err) {
            log('ERROR', 'Error joining document', err);
            socket.emit('doc:error', { message: 'Failed to join document' });
        }
    });

    // ✅ MOVED OUTSIDE - only registered once per socket
    socket.on('doc:update', async ({ documentId, update }) => {
        try {
            const ydoc = docs.get(documentId);
            if (!ydoc) {
                socket.emit('doc:error', { message: 'Document not found' });
                return;
            }
            
            const updateArray = new Uint8Array(update);
            Y.applyUpdate(ydoc, updateArray);
            
            // Broadcast to others in the room
            socket.to(documentId).emit('doc:update', update);
            
        } catch (err) {
            log('ERROR', 'Error applying update', err);
            socket.emit('doc:error', { message: 'Failed to apply update' });
        }
    });

    socket.on('doc:leave', (documentId) => {
        socket.leave(documentId);
        log('INFO', `Socket ${socket.id} left document ${documentId}`);
    });

    socket.on('disconnect', async () => {
        try {
            for (const roomId of socket.rooms) {
                if (roomId === socket.id) continue;
                
                const room = io.sockets.adapter.rooms.get(roomId);
                if (!room || room.size === 0) {
                    const ydoc = docs.get(roomId);
                    if (ydoc) {
                        // Force immediate save
                        if (pendingSaves.has(roomId)) {
                            clearTimeout(pendingSaves.get(roomId));
                            pendingSaves.delete(roomId);
                        }
                        
                        const yText = ydoc.getText('content');
                        await Document.findByIdAndUpdate(roomId, {
                            yjsState: Buffer.from(Y.encodeStateAsUpdate(ydoc)),
                            content: yText ? yText.toString() : '',
                            lastUpdatedAt: new Date(),
                        });
                        
                        ydoc.destroy();
                        docs.delete(roomId);
                        log('INFO', `Cleaned up document ${roomId}`);
                    }
                }
            }
        } catch (err) {
            log('ERROR', 'Error during disconnect cleanup', err);
        }
    });
};

export default registerDocumentHandlers;