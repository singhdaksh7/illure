import { Request, Response, NextFunction } from 'express';
import { ContentService } from './content.service.js';

export class ContentController {
  // Public
  static async getActiveBanners(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await ContentService.listBanners(true);
      return res.status(200).json({ success: true, data: { banners } });
    } catch (err) {
      next(err);
    }
  }

  static async getActiveTickers(_req: Request, res: Response, next: NextFunction) {
    try {
      const tickers = await ContentService.listTickers(true);
      return res.status(200).json({ success: true, data: { tickers } });
    } catch (err) {
      next(err);
    }
  }

  static async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug);
      const page = await ContentService.getStaticPageBySlug(slug);
      return res.status(200).json({ success: true, data: { page } });
    } catch (err) {
      next(err);
    }
  }

  static async checkRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const path = (req.query.path as string) || '';
      const redirect = await ContentService.findRedirect(path);
      return res.status(200).json({ success: true, data: { redirect } });
    } catch (err) {
      next(err);
    }
  }

  // Admin Banners
  static async listAdminBanners(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await ContentService.listBanners(false);
      return res.status(200).json({ success: true, data: { banners } });
    } catch (err) {
      next(err);
    }
  }

  static async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await ContentService.createBanner(req.body);
      return res.status(201).json({ success: true, data: { banner } });
    } catch (err) {
      next(err);
    }
  }

  static async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await ContentService.updateBanner(id, req.body);
      return res.status(200).json({ success: true, data: { banner } });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await ContentService.deleteBanner(id);
      return res.status(200).json({ success: true, message: 'Banner deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // Admin Tickers
  static async listAdminTickers(_req: Request, res: Response, next: NextFunction) {
    try {
      const tickers = await ContentService.listTickers(false);
      return res.status(200).json({ success: true, data: { tickers } });
    } catch (err) {
      next(err);
    }
  }

  static async createTicker(req: Request, res: Response, next: NextFunction) {
    try {
      const ticker = await ContentService.createTicker(req.body);
      return res.status(201).json({ success: true, data: { ticker } });
    } catch (err) {
      next(err);
    }
  }

  static async updateTicker(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const ticker = await ContentService.updateTicker(id, req.body);
      return res.status(200).json({ success: true, data: { ticker } });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTicker(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await ContentService.deleteTicker(id);
      return res.status(200).json({ success: true, message: 'Ticker deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // Admin Static Pages
  static async listAdminPages(_req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await ContentService.listStaticPages(false);
      return res.status(200).json({ success: true, data: { pages } });
    } catch (err) {
      next(err);
    }
  }

  static async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await ContentService.createStaticPage(req.body);
      return res.status(201).json({ success: true, data: { page } });
    } catch (err) {
      next(err);
    }
  }

  static async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const page = await ContentService.updateStaticPage(id, req.body);
      return res.status(200).json({ success: true, data: { page } });
    } catch (err) {
      next(err);
    }
  }

  static async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await ContentService.deleteStaticPage(id);
      return res.status(200).json({ success: true, message: 'Page deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // Admin Redirects
  static async listAdminRedirects(_req: Request, res: Response, next: NextFunction) {
    try {
      const redirects = await ContentService.listRedirects();
      return res.status(200).json({ success: true, data: { redirects } });
    } catch (err) {
      next(err);
    }
  }

  static async createRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const redirect = await ContentService.createRedirect(req.body);
      return res.status(201).json({ success: true, data: { redirect } });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await ContentService.deleteRedirect(id);
      return res.status(200).json({ success: true, message: 'Redirect deleted.' });
    } catch (err) {
      next(err);
    }
  }
}
