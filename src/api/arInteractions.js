import { API_BASE_URL } from './config';

export const AR_INTERACTION_TYPES = Object.freeze({
  PRODUCT_SELECT: 'PRODUCT_SELECT',
  PRODUCT_DESELECT: 'PRODUCT_DESELECT',
  FITTING: 'FITTING',
  WISHLIST_ADD: 'WISHLIST_ADD',
  WISHLIST_REMOVE: 'WISHLIST_REMOVE',
});

/** @typedef {Object} ArInteractionCreateResponse
 * @property {number} arInteractionId
 * @property {number} arSessionId
 * @property {number} productId
 * @property {'PRODUCT_SELECT'|'PRODUCT_DESELECT'|'FITTING'|'WISHLIST_ADD'|'WISHLIST_REMOVE'} interactionType
 * @property {string|null} avatarImageUrl
 * @property {number} sequenceNo
 * @property {string} createdAt
 */

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

  /** @type {ArInteractionCreateResponse|null} */
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  return data;
}
