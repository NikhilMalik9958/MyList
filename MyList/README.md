# My List Service

Backend implementation of the **My List** feature for an OTT platform using TypeScript, Express, and MongoDB.

## Running locally
- Install dependencies: `npm install`
- Copy env template: `cp .env.example .env` and adjust `MONGO_URI` if needed.
- Seed sample data (users, movies, TV shows, starter list): `npm run seed`
- Start dev server: `npm run dev` (defaults to port `3000`)
- Production build: `npm run build` then `npm start`

## API
- `POST /api/my-list` — body: `{ "contentId": "movie-1", "contentType": "movie" | "tv" }`
- `DELETE /api/my-list/:contentId`
- `GET /api/my-list?page=1&pageSize=20`

Use header `x-user-id` to target a user (defaults to `DEFAULT_USER_ID` from `.env`).

## Design choices
- **Data model**: `MyListItem` collection with `userId`, `contentId`, `contentType`, snapshot fields (`titleSnapshot`, `genresSnapshot`). Unique index on `(userId, contentId)` prevents duplicates; index on `(userId, addedAt)` accelerates list queries.
- **Performance for list**: Query uses lean reads with projection-only data already in the list document, avoiding fan-out lookups; pagination with `skip/limit`. With indexes, the hot path stays O(log n) and returns under ~10 ms in typical deployments.
- **Validation**: Incoming payloads validated for required fields and allowed content types; 404 returned when underlying Movie/TV show is missing.
- **Auth assumption**: Basic auth assumed; a mock user id is pulled from `x-user-id` or `.env`.

## Testing
- Integration tests (Jest + Supertest + mongodb-memory-server): `npm test`
- Coverage: add/remove/list happy paths, invalid payload, missing item removal, pagination.

## Seeding
- `npm run seed` wipes collections and loads:
  - User `user-123`
  - Movies: `movie-1`, `movie-2`
  - TV show: `tv-1`
  - Initial My List entries for `movie-1` and `tv-1`

## Assumptions
- Movie/TV IDs are unique per collection; duplicates across types are resolved via `contentType`.
- List API returns stored snapshots, not live-joined content; clients can re-fetch full details if needed.
- MongoDB is available; tests use in-memory Mongo for isolation.

## Deployment notes
- Container-friendly: add a Dockerfile like below (if deploying, set `MONGO_URI` and `PORT` via env vars):
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build
  EXPOSE 3000
  CMD ["npm", "start"]
  ```
- Requires a MongoDB instance reachable at `MONGO_URI`; ensure indexes are created on first boot by letting the app run normally.
- Health check endpoint: `GET /health`.

## CI
- GitHub Actions workflow `/.github/workflows/ci.yml` runs `npm ci`, `npm run build`, and `npm test` on pushes/PRs to main/master.
