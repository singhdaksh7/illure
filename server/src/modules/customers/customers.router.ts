import { Router } from 'express';
import customerAddressesRouter from './customerAddresses.router.js';

const router = Router();

router.use('/addresses', customerAddressesRouter);

export default router;
