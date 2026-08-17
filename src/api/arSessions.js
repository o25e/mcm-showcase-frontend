import { API_BASE_URL } from './config';

export async function evaluateArSessionMessage(arSessionId) {
  if (!Number.isFinite(arSessionId)) {
    return { skipped: true };
  }

  const response = await fetch(`${API_BASE_URL}/api/ar-sessions/${arSessionId}/messages/evaluate`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`AR message evaluation failed (${response.status})`);
  }

  return response.json();
}
