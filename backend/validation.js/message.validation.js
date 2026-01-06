import z from "zod";

export const sendRoomMessageSchema = z.object({
    roomId: z.string().min(1),
    message: z.string().min(1),
});

export const sendDirectMessageSchema = z.object({
    to: z.string().min(1),
    message: z.string().min(1),
})