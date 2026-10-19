import { MOCK_DELAY } from '../config';
import { handleApiError } from '../api/errorHandler';
import { ApiError } from './handlers';
import { nowIso } from './db';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs a mock handler after a fake network delay.
// Errors are reshaped to look exactly like an Axios error
// (error.response.status / error.response.data = contract Error JSON),
// and passed through the same handleApiError() the real interceptor uses.
export async function mockCall(handler, { url = '', silent = false } = {}) {
  await wait(MOCK_DELAY);
  try {
    return handler();
  } catch (err) {
    if (!(err instanceof ApiError)) throw err; // real bug in mock code – surface it
    const axiosLikeError = new Error(err.message);
    axiosLikeError.config = { url, silent };
    axiosLikeError.response = {
      status: err.status,
      data: { status: err.status, message: err.message, timestamp: nowIso() },
    };
    handleApiError(axiosLikeError);
    throw axiosLikeError;
  }
}
