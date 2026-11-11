import { Router } from 'express';
import { GiftingController } from './gifting.controller.js';

export const giftingRouter = Router();

giftingRouter.post('/gift-cards', GiftingController.issueGiftCard);
giftingRouter.get('/gift-cards/:code/balance', GiftingController.checkBalance);
giftingRouter.post('/gift-cards/redeem', GiftingController.redeem);
giftingRouter.get('/free-samples/eligibility', GiftingController.getFreeSamplesEligibility);
giftingRouter.get('/gift-finder', GiftingController.findGift);
