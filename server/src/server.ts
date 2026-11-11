import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { DiscoverySetsService } from './modules/discoverySets/discoverySets.service.js';

const PORT = env.PORT || 5000;

app.listen(PORT, async () => {
  logger.info(`✨ İLLURÊ Fragrance API Server running on port ${PORT} [${env.NODE_ENV}]`);
  logger.info(`🔗 API Health Endpoint: http://localhost:${PORT}/api/health`);

  try {
    await DiscoverySetsService.seedDefaults();
  } catch (err: any) {
    logger.warn('Discovery sets seed warning:', { error: err?.message || String(err) });
  }
});
