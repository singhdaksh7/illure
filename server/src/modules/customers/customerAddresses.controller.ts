import { Response, NextFunction } from 'express';
import { CustomerAddressService } from './customerAddresses.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';

export class CustomerAddressController {
  static async list(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const addresses = await CustomerAddressService.listAddresses(customerId);
      return sendSuccess(res, { addresses });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const address = await CustomerAddressService.createAddress(customerId, req.body);
      return sendSuccess(res, { address }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const addressId = req.params.id as string;
      const address = await CustomerAddressService.updateAddress(customerId, addressId, req.body);
      return sendSuccess(res, { address });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const addressId = req.params.id as string;
      const result = await CustomerAddressService.deleteAddress(customerId, addressId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async setDefault(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const addressId = req.params.id as string;
      const address = await CustomerAddressService.setDefaultAddress(customerId, addressId);
      return sendSuccess(res, { address });
    } catch (error) {
      next(error);
    }
  }
}
