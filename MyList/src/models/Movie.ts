import { Schema, model, Document } from 'mongoose';
import { Genre } from '../types';

export interface MovieDocument extends Document {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director: string;
  actors: string[];
}

const MovieSchema = new Schema<MovieDocument>({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genres: [{ type: String, required: true }],
  releaseDate: { type: Date, required: true },
  director: { type: String, required: true },
  actors: [{ type: String, required: true }]
});

export const MovieModel = model<MovieDocument>('Movie', MovieSchema);
