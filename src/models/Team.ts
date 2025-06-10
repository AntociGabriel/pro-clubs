import mongoose, { Schema, Document, models, model } from 'mongoose';
import { IUser } from './User';

export interface ITeam extends Document {
  name: string;
  logo?: string;
  photo?: string;
  members: mongoose.Types.ObjectId[];
  captain: IUser | mongoose.Types.ObjectId;
  requests: mongoose.Types.ObjectId[];
  elo: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  photo: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  captain: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  elo: { type: Number, default: 1000 },
  rating: { type: Number, default: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Team || model<ITeam>('Team', TeamSchema); 