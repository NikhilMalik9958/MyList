import { FilterQuery } from 'mongoose';
import { MyListItemModel, ContentType, MyListItemDocument } from '../models/MyListItem';
import { MovieModel } from '../models/Movie';
import { TVShowModel } from '../models/TVShow';
import { HttpError } from '../utils/httpError';
import { Genre } from '../types';

const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

type Snapshot = { title: string; genres: Genre[] };

const fetchSnapshot = async (contentId: string, contentType: ContentType): Promise<Snapshot> => {
  if (contentType === 'movie') {
    const movie = await MovieModel.findOne({ id: contentId }).lean();
    if (!movie) {
      throw new HttpError(404, 'Movie not found');
    }
    return { title: movie.title, genres: movie.genres };
  }

  const tvShow = await TVShowModel.findOne({ id: contentId }).lean();
  if (!tvShow) {
    throw new HttpError(404, 'TV Show not found');
  }
  return { title: tvShow.title, genres: tvShow.genres };
};

export const addToMyList = async (
  userId: string,
  contentId: string,
  contentType: ContentType
): Promise<MyListItemDocument> => {
  const { title, genres } = await fetchSnapshot(contentId, contentType);

  try {
    const item = await MyListItemModel.findOneAndUpdate(
      { userId, contentId } as FilterQuery<MyListItemDocument>,
      {
        $setOnInsert: {
          contentType,
          titleSnapshot: title,
          genresSnapshot: genres,
          addedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!item) {
      throw new HttpError(500, 'Unable to add item');
    }
    return item;
  } catch (err: any) {
    if (err.code === 11000) {
      throw new HttpError(409, 'Item already in list');
    }
    throw err;
  }
};

export const removeFromMyList = async (userId: string, contentId: string): Promise<void> => {
  const result = await MyListItemModel.deleteOne({ userId, contentId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Item not found in list');
  }
};

export interface ListResponse {
  items: MyListItemDocument[];
  page: number;
  pageSize: number;
  total: number;
}

export const listMyItems = async (
  userId: string,
  pageRaw?: number,
  pageSizeRaw?: number
): Promise<ListResponse> => {
  const page = Math.max(PAGE_DEFAULT, pageRaw || PAGE_DEFAULT);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, pageSizeRaw || PAGE_SIZE_DEFAULT));

  const query = { userId };
  const [items, total] = await Promise.all([
    MyListItemModel.find(query)
      .sort({ addedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    MyListItemModel.countDocuments(query)
  ]);

  return { items: items as unknown as MyListItemDocument[], page, pageSize, total };
};
