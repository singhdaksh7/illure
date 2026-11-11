import { Router } from 'express';
import { RetentionController } from './retention.controller.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';

export const retentionRouter = Router();

retentionRouter.get('/scent-profile', requireCustomerAuth, RetentionController.getProfile);
retentionRouter.put('/scent-profile', requireCustomerAuth, RetentionController.saveProfile);
retentionRouter.get('/recommendations', RetentionController.getRecommendations);
retentionRouter.get('/buy-again', requireCustomerAuth, RetentionController.getBuyAgain);
retentionRouter.post('/reviews', requireCustomerAuth, RetentionController.submitReview);
retentionRouter.get('/products/:productId/reviews', RetentionController.getProductReviews);
