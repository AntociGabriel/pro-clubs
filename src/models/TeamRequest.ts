import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamRequest extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const teamRequestSchema = new Schema<ITeamRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one pending request per user per team
teamRequestSchema.index({ user: 1, team: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'pending' }
});

export default mongoose.models.TeamRequest || mongoose.model<ITeamRequest>('TeamRequest', teamRequestSchema); 