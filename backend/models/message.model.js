import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Types.ObjectId, ref: 'Room', required: true },
    message: { type: String, required: true },
    messageDeletedBySender: { type: boolean, default: false },
    messageDeletedByReceiver: { type: boolean, default: false }

}, { 
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

export default Message;