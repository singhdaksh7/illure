import { Router } from 'express';
import { sendSuccess } from '../../utils/response.utils.js';

const router = Router();

router.get('/', (_req, res) => {
  return sendSuccess(res, { message: 'Reference Brands API module boundary established.' });
});

export default router;
