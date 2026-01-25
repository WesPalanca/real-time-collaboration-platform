import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
    title: { type: String, required: true },
    yjsState: {type: Buffer, required: false},
    content: { type: String },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    editors: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    lastUpdatedAt: { type: Date, default: Date.now() }
})

const Document = mongoose.model('Document', documentSchema);

export default Document;