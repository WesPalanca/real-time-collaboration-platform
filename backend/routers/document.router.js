import express from "express";
const router = express.Router();
import { addUser, createDocument, getDocuments } from "../controllers/document.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.post('/', verifyToken, createDocument);
router.get('/', verifyToken, getDocuments);
router.post('/:documentId/editors', verifyToken, addUser);

export default router