import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
    name: { type: String, required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    lastMessage: { type: mongoose.Types, ObjectId, ref: 'Message' }
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);

export default Room