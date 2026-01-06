import Room from "../models/room.model.js";
import log from "../utils/log.js";

export const createRoom = async (req, res) => {
    try {
        const { roomName, members} = req.body;
        const creator = req.user.userId;
        const newRoom = new Room({
            name: roomName,
            members: members,
            createdBy: creator
        })
        await newRoom.save();
        log('INFO', 'Successfully created room');
        return res.status(201).json({ success: true, message: 'Successfully created room' });

    }
    catch (err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' } );
    }
}