import { Schema, model, Document } from 'mongoose';
import { Genre } from '../types';

export type ContentType = 'movie' | 'tv';

export interface MyListItemDocument extends Document {
  userId: string;
  contentId: string;
  contentType: ContentType;
  titleSnapshot: string;
  genresSnapshot: Genre[];
  addedAt: Date;
}

const MyListItemSchema = new Schema<MyListItemDocument>({
  userId: { type: String, required: true, index: true },
  contentId: { type: String, required: true },
  contentType: { type: String, required: true, enum: ['movie', 'tv'] },
  titleSnapshot: { type: String, required: true },
  genresSnapshot: [{ type: String, required: true }],
  addedAt: { type: Date, default: Date.now }
});

MyListItemSchema.index({ userId: 1, contentId: 1 }, { unique: true });
MyListItemSchema.index({ userId: 1, addedAt: -1 });

export const MyListItemModel = model<MyListItemDocument>('MyListItem', MyListItemSchema);
