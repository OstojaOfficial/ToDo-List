import mongoose, { Document, Schema } from 'mongoose';

export interface ITask {
    title: string;
	expire: number;
}

export interface ITaskModel extends ITask, Document {}

const TaskSchema: Schema = new Schema({
    title: {
        required: true,
        type: String
    },
	token: {
		required: true,
		type: String
	},
    expire: {
        required: true,
        type: Number
    }
});

export default mongoose.model<ITaskModel>('Task', TaskSchema);