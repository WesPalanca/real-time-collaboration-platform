import Room from "../models/room.model.js";
import log from "../utils/log.js";

export const createRoom = async (req, res) => {
    try {
        console.log(req.body);
        const { roomName, members = []} = req.body;
        log('INFO', 'Creating room', { roomName: roomName, members: members });
        const creator = req.user.userId;
        members.push(creator)
        const newRoom = new Room({
            name: roomName,
            members: members,
            createdBy: creator
        })
        await newRoom.save();
        log('INFO', 'Successfully created room');
        return res.status(201).json({ success: true, message: 'Successfully created room', room: newRoom });

    }
    catch (err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' } );
    }
}