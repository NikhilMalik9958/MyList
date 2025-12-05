import express, { Request, Response, NextFunction } from 'express';
import myListRoutes from './routes/myList';
import { HttpError } from './utils/httpError';

const app = express();
app.use(express.json());

app.use('/api/my-list', myListRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
