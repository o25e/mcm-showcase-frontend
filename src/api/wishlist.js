import { request } from './client';

function wishlistPath(memberId, productId = '') {
  const member = encodeURIComponent(String(memberId));
  const product = productId === '' ? '' : `/${encodeURIComponent(String(productId))}`;
  return `/api/members/${member}/wishlist${product}`;
}

export function getMemberWishlist(memberId) {
  return request(wishlistPath(memberId));
}

export function addMemberWishlistItem(memberId, productId) {
  return request(wishlistPath(memberId, productId), { method: 'PUT' });
}

export function removeMemberWishlistItem(memberId, productId) {
  return request(wishlistPath(memberId, productId), { method: 'DELETE' });
}

