import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AIProviderError,
  AIProviderErrorCode,
} from '../src/services/aiClient.service.js';
import { getChatFailure } from '../src/controllers/chatController.js';

test('maps provider rate limits to a retryable API error', () => {
  const error = getChatFailure(new AIProviderError(
    'AI service is busy right now.',
    AIProviderErrorCode.RATE_LIMITED,
  ));

  assert.equal(error.statusCode, 429);
  assert.equal(error.message, 'AI service is busy right now. Please try again shortly.');
});

test('maps exhausted provider failures to a non-success API error', () => {
  const error = getChatFailure(new AIProviderError(
    'AI service returned an error.',
    AIProviderErrorCode.AI_SERVICE_ERROR,
  ));

  assert.equal(error.statusCode, 503);
  assert.equal(error.message, 'AI service returned an error.');
});
