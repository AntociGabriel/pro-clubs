import mongoose from 'mongoose';
import { IUser } from './User';

export interface ITeam extends mongoose.Document {
  name: string;
  logo?: string;
  members: mongoose.Types.ObjectId[];
  captain: mongoose.Types.ObjectId;
  requests: mongoose.Types.ObjectId[];
  elo: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  logo: {
    type: String,
    required: true
  },
  elo: {
    type: Number,
    default: 1000
  },
  rating: {
    type: Number,
    default: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only be a member of one team
teamSchema.pre('save', async function(next) {
  if (this.isModified('members')) {
    const Team = mongoose.model('Team');
    for (const memberId of this.members) {
      const existingTeam = await Team.findOne({
        members: memberId,
        _id: { $ne: this._id }
      });
      if (existingTeam) {
        throw new Error(`User ${memberId} is already a member of another team`);
      }
    }
  }
  next();
});

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema); 