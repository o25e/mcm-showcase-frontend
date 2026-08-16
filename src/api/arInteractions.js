import { API_BASE_URL } from './config';

export const AR_INTERACTION_TYPES = Object.freeze({
  PRODUCT_SELECT: 'PRODUCT_SELECT',
  FITTING_ADD: 'FITTING_ADD',
  FITTING_REMOVE: 'FITTING_REMOVE',
  WISHLIST_ADD: 'WISHLIST_ADD',
  WISHLIST_REMOVE: 'WISHLIST_REMOVE',
});

export async function postArInteraction({ arSessionId, productId, interactionType }) {
  if (!Number.isFinite(arSessionId) || !Number.isFinite(productId)) {
    return { skipped: true };
  }

  const response = await fetch(`${API_BASE_URL}/api/ar-interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arSessionId, productId, interactionType }),
  });

  if (!response.ok) {
    throw new Error(`AR interaction failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json().catch(() => null);
}
