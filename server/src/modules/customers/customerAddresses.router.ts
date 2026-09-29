import { Router } from 'express';
import { CustomerAddressController } from './customerAddresses.controller.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { addressCreateSchema, addressUpdateSchema } from './customerAddresses.validation.js';

const customerAddressesRouter = Router();

customerAddressesRouter.use(requireCustomerAuth);

customerAddressesRouter.get('/', CustomerAddressController.list);
customerAddressesRouter.post('/', validateRequest({ body: addressCreateSchema }), CustomerAddressController.create);
customerAddressesRouter.patch('/:id', validateRequest({ body: addressUpdateSchema }), CustomerAddressController.update);
customerAddressesRouter.delete('/:id', CustomerAddressController.delete);
customerAddressesRouter.post('/:id/default', CustomerAddressController.setDefault);

export default customerAddressesRouter;
