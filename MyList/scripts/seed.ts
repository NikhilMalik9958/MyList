import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/config/db';
import { UserModel } from '../src/models/User';
import { MovieModel } from '../src/models/Movie';
import { TVShowModel } from '../src/models/TVShow';
import { MyListItemModel } from '../src/models/MyListItem';

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    UserModel.deleteMany({}),
    MovieModel.deleteMany({}),
    TVShowModel.deleteMany({}),
    MyListItemModel.deleteMany({})
  ]);

  const user = await UserModel.create({
    id: 'user-123',
    username: 'demo-user',
    preferences: {
      favoriteGenres: ['Action', 'Comedy'],
      dislikedGenres: ['Horror']
    },
    watchHistory: []
  });

  const movies = await MovieModel.insertMany([
    {
      id: 'movie-1',
      title: 'Fast Action',
      description: 'High stakes adventure.',
      genres: ['Action'],
      releaseDate: new Date('2020-01-01'),
      director: 'Jane Director',
      actors: ['Actor A', 'Actor B']
    },
    {
      id: 'movie-2',
      title: 'Laugh Out Loud',
      description: 'A comedy to remember.',
      genres: ['Comedy'],
      releaseDate: new Date('2021-06-01'),
      director: 'John Funny',
      actors: ['Comedian A', 'Comedian B']
    }
  ]);

  const tvShows = await TVShowModel.insertMany([
    {
      id: 'tv-1',
      title: 'Space Journey',
      description: 'SciFi exploration.',
      genres: ['SciFi'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2023-01-01'),
          director: 'SciFi Director',
          actors: ['Astronaut A']
        }
      ]
    }
  ]);

  await MyListItemModel.insertMany([
    {
      userId: user.id,
      contentId: movies[0].id,
      contentType: 'movie',
      titleSnapshot: movies[0].title,
      genresSnapshot: movies[0].genres,
      addedAt: new Date()
    },
    {
      userId: user.id,
      contentId: tvShows[0].id,
      contentType: 'tv',
      titleSnapshot: tvShows[0].title,
      genresSnapshot: tvShows[0].genres,
      addedAt: new Date()
    }
  ]);

  console.log('Seed completed');
  await disconnectDB();
};

seed().catch((err) => {
  console.error('Seed failed', err);
  disconnectDB();
});
