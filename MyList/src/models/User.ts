import { Schema, model, Document } from 'mongoose';
import { Genre } from '../types';

export interface UserDocument extends Document {
  id: string;
  username: string;
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}

const UserSchema = new Schema<UserDocument>({
  id: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  preferences: {
    favoriteGenres: [{ type: String }],
    dislikedGenres: [{ type: String }]
  },
  watchHistory: [
    {
      contentId: { type: String, required: true },
      watchedOn: { type: Date, required: true },
      rating: { type: Number }
    }
  ]
});

export const UserModel = model<UserDocument>('User', UserSchema);
