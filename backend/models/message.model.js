import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Types.ObjectId, ref: 'User' },
    roomId: { type: mongoose.Types.ObjectId, ref: 'Room' },
    message: { type: String, required: true },
    messageDeletedBySender: { type: Boolean, default: false },
    messageDeletedByReceiver: { type: Boolean, default: false }

}, { 
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

export default Message;