import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { MovieModel } from '../src/models/Movie';
import { TVShowModel } from '../src/models/TVShow';
import { MyListItemModel } from '../src/models/MyListItem';

let mongoServer: MongoMemoryServer;
const userId = 'user-123';

const seedData = async () => {
  await Promise.all([MovieModel.deleteMany({}), TVShowModel.deleteMany({}), MyListItemModel.deleteMany({})]);

  await MovieModel.insertMany([
    {
      id: 'movie-1',
      title: 'Fast Action',
      description: 'High stakes adventure.',
      genres: ['Action'],
      releaseDate: new Date('2020-01-01'),
      director: 'Jane Director',
      actors: ['Actor A', 'Actor B']
    }
  ]);

  await TVShowModel.insertMany([
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
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await seedData();
});

describe('My List API', () => {
  it('adds a movie to the list', async () => {
    const res = await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'movie-1', contentType: 'movie' })
      .expect(201);

    expect(res.body.contentId).toBe('movie-1');
    expect(res.body.contentType).toBe('movie');

    const inDb = await MyListItemModel.findOne({ userId, contentId: 'movie-1' });
    expect(inDb).toBeTruthy();
  });

  it('prevents adding duplicate items', async () => {
    await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'movie-1', contentType: 'movie' })
      .expect(201);

    // Second add should not create another entry
    const res = await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'movie-1', contentType: 'movie' })
      .expect(201);

    expect(res.body.contentId).toBe('movie-1');
    const count = await MyListItemModel.countDocuments({ userId, contentId: 'movie-1' });
    expect(count).toBe(1);
  });

  it('returns 400 for invalid payload', async () => {
    await request(app).post('/api/my-list').set('x-user-id', userId).send({ contentId: '' }).expect(400);
  });

  it('removes an item from the list', async () => {
    await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'tv-1', contentType: 'tv' })
      .expect(201);

    await request(app).delete('/api/my-list/tv-1').set('x-user-id', userId).expect(204);

    const count = await MyListItemModel.countDocuments({ userId, contentId: 'tv-1' });
    expect(count).toBe(0);
  });

  it('returns 404 when removing missing item', async () => {
    await request(app).delete('/api/my-list/not-there').set('x-user-id', userId).expect(404);
  });

  it('lists items with pagination', async () => {
    await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'movie-1', contentType: 'movie' });
    await request(app)
      .post('/api/my-list')
      .set('x-user-id', userId)
      .send({ contentId: 'tv-1', contentType: 'tv' });

    const res = await request(app).get('/api/my-list?page=1&pageSize=1').set('x-user-id', userId).expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(1);
  });
});
