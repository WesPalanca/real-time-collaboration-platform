import Document from "../models/document.model.js";
import { addUserToEntity } from "../services/user.service.js";
import log from "../utils/log.js";

export const createDocument = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, editors } = req.body;
        const editorsArr = Array.isArray(editors) ? editors : [];
        const uniqueEditors = [...new Set([userId, ...editorsArr])];
        const newDoc = await Document.create({
            title: title.trim(),
            content: '',
            owner: userId,
            editors: uniqueEditors,

        });

        log('INFO', 'Successfully created document', newDoc);
        res.status(201).json({ success: true, message: 'Successfully created document', documentId: newDoc._id, document: newDoc});

    }
    catch (err){
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getDocuments = async (req, res) => {
    try {
        log('INFO', 'fetching docs');
        const userId = req.user.userId;
        const docs = await Document.find({ editors: userId });
        log('INFO', 'Successfully fetched docs');
        return res.status(200).json({ success: true, message: 'successfully fetched docs', docs });
    }
    catch(err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' });

    }
}

export const addUser = async (req, res) => {
    try {
        log('INFO', 'Adding user to doc');
        const { recipientId } = req.body;
        const { documentId } = req.params;
        const update = await addUserToEntity(Document, documentId, recipientId, 'editors');

        if (!update){
            log('ERROR', 'Doc not found');
            return res.status(404).json({ success: false, message: 'Doc not found'});
        }
        log('INFO', 'Successfully added user to doc');
        return res.status(500).json({ success: true, message: 'Successfully added user to doc',  document: update  });
        
    }
    catch (err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}