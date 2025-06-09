import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  teams: mongoose.Types.ObjectId[];
}

const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
});

export default models.Tournament || model<ITournament>('Tournament', TournamentSchema); 