import Room from "../models/room.model.js";
import { addUserToEntity } from "../services/user.service.js";
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
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getRooms = async (req, res) => {
    try {
        log('INFO', 'Fetching rooms');
        const userId = req.user.userId;
        const rooms = await Room.find({ members: userId });
        log('INFO', 'Successfully fetched rooms')
        return res.status(200).json({ success: true, message: 'Successfully fetched rooms', rooms })
    }
    catch (err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const addUser = async (req, res) => {
    try {
        log('INFO', 'Adding user to room');
        const { roomId } = req.params;
        const { recipientId } = req.body;
        const update = await addUserToEntity(Room, roomId, recipientId, 'members');
        if (!update) {
            log('ERROR', 'Room not found');
            return res.status(404).json({ success: false, message: 'Room not found'});
        }
        log('INFO', 'Successfully added user to room')
        return res.status(200).json({ success: true, message: 'Successfully added user to room' })

    }
    catch (err) {
        log('ERROR', 'Internal server error');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}