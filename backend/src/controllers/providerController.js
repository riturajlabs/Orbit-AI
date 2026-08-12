import { asyncHandler } from '../utils/asyncHandler.js';
import { getAIProviderStatus, getAIServiceConfig } from '../services/aiClient.service.js';
import { getGroqProviderStatus } from '../config/groq.js';

export const getProviderStatus = asyncHandler(async (_req, res) => {
  const backendConfig = getAIServiceConfig();
  const groqStatus = getGroqProviderStatus();
  const aiServiceStatus = await getAIProviderStatus();

  res.status(200).json({
    status: 'success',
    data: {
      backend: {
        aiServiceUrl: backendConfig.url,
        aiServiceKeyConfigured: backendConfig.keyConfigured,
        groq: groqStatus,
      },
      aiService: aiServiceStatus,
    },
  });
});
