import { request } from './client';

export const AR_INTERACTION_TYPES = Object.freeze({
  PRODUCT_SELECT: 'PRODUCT_SELECT',
  PRODUCT_DESELECT: 'PRODUCT_DESELECT',
  FITTING_ADD: 'FITTING_ADD',
  FITTING_REMOVE: 'FITTING_REMOVE',
  WISHLIST_ADD: 'WISHLIST_ADD',
  WISHLIST_REMOVE: 'WISHLIST_REMOVE',
});

/** @typedef {Object} ArInteractionCreateResponse
 * @property {number} arInteractionId
 * @property {number} arSessionId
 * @property {number} productId
 * @property {'PRODUCT_SELECT'|'PRODUCT_DESELECT'|'FITTING_ADD'|'FITTING_REMOVE'|'WISHLIST_ADD'|'WISHLIST_REMOVE'} interactionType
 * @property {string|null} avatarImageUrl
 * @property {number} sequenceNo
 * @property {string} createdAt
 */

export async function postArInteraction({ arSessionId, productId, interactionType }) {
  if (!Number.isFinite(arSessionId) || !Number.isFinite(productId)) {
    return { skipped: true };
  }

  return request('/api/ar-interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arSessionId, productId, interactionType }),
  });

}
