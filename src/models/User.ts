import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  nickname: string;
  originId?: string;
  password?: string;
  image?: string;
  platform?: string;
  country?: string;
  eaId: string;
  positions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  nickname: { type: String, required: true, unique: true },
  originId: { type: String },
  password: { type: String },
  image: { type: String },
  platform: { type: String },
  country: { type: String },
  eaId: { type: String, required: true, unique: true },
  positions: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.User || model<IUser>('User', UserSchema);