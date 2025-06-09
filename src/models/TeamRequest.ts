import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITeamRequest extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  platform: string;
  positions: string[];
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

const TeamRequestSchema = new Schema<ITeamRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  platform: { type: String, required: true },
  positions: [{ type: String, required: true }],
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default models.TeamRequest || model<ITeamRequest>('TeamRequest', TeamRequestSchema); 