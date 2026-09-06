import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mcm.wishlist';
const EVENT_NAME = 'mcm:wishlist-changed';

// A wishlist is owned by the user, so its identity must not depend on the
// screen that added the product (AR, closet, or collection).
export function wishlistIdForProduct(productId) {
  return `product-${String(productId)}`;
}

function productIdFromWishlistItem(item) {
  if (item?.productId !== undefined && item?.productId !== null) return String(item.productId);
  const legacyId = String(item?.wishlistId ?? '');
  return legacyId.replace(/^(?:main|closet|ar|product)-/, '');
}

function normalizeWishlist(items) {
  const seen = new Set();
  return items.reduce((result, item) => {
    const productId = productIdFromWishlistItem(item);
    if (!productId || seen.has(productId)) return result;
    seen.add(productId);
    result.push({ ...item, productId, wishlistId: wishlistIdForProduct(productId) });
    return result;
  }, []);
}

function readWishlist() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? normalizeWishlist(saved) : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
}

export function isWishlisted(wishlistId) {
  const productId = productIdFromWishlistItem({ wishlistId });
  return readWishlist().some((item) => item.productId === productId);
}

export function saveWishlistItem(item) {
  const productId = productIdFromWishlistItem(item);
  const wishlistItem = { ...item, productId, wishlistId: wishlistIdForProduct(productId) };
  writeWishlist([wishlistItem, ...readWishlist().filter((saved) => saved.productId !== productId)]);
}

export function removeWishlistItem(wishlistId) {
  const productId = productIdFromWishlistItem({ wishlistId });
  writeWishlist(readWishlist().filter((item) => item.productId !== productId));
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(readWishlist);
  const sync = useCallback((event) => setWishlist(Array.isArray(event?.detail) ? event.detail : readWishlist()), []);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  return [wishlist, (item) => {
    if (isWishlisted(item.productId ?? item.wishlistId)) removeWishlistItem(item.productId ?? item.wishlistId);
    else saveWishlistItem(item);
  }];
}
