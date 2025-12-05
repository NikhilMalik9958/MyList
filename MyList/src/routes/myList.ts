import { Router, Request, Response, NextFunction } from 'express';
import { addToMyList, removeFromMyList, listMyItems } from '../services/myListService';
import { HttpError } from '../utils/httpError';

const router = Router();

const getUserId = (req: Request): string => {
  const headerId = req.header('x-user-id');
  return headerId || process.env.DEFAULT_USER_ID || 'demo-user';
};

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentId, contentType } = req.body;
    if (!contentId || !contentType) {
      throw new HttpError(400, 'contentId and contentType are required');
    }
    if (!['movie', 'tv'].includes(contentType)) {
      throw new HttpError(400, 'contentType must be movie or tv');
    }

    const item = await addToMyList(getUserId(req), contentId, contentType);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:contentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.params;
    await removeFromMyList(getUserId(req), contentId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
    const result = await listMyItems(getUserId(req), page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
