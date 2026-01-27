import mongoose from "mongoose";


export const addUserToEntity = async (Model, entityId, userId, field) => {
    const update = await Model.findByIdAndUpdate(entityId, {
        $addToSet: { [field]: userId },
    }, {
        new: true
    });
    if (!update) {
        throw new Error(`${Model.modelName} not found`);
    }

    return update;
}