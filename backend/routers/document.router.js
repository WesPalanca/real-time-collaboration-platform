import express from "express";
const router = express.Router();
import { createDocument, getDocuments } from "../controllers/document.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.post('/', verifyToken, createDocument);
router.get('/', verifyToken, getDocuments);

export default router