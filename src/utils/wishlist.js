import { useCallback, useEffect, useMemo, useState } from 'react';

const LEGACY_STORAGE_KEY = 'mcm.wishlist';
const GUEST_STORAGE_KEY = 'mcm.wishlist.guest';
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

function getStorageKey(memberId) {
  const hasMemberId = memberId !== undefined && memberId !== null && String(memberId) !== '';
  return hasMemberId ? `mcm.wishlist.member.${String(memberId)}` : GUEST_STORAGE_KEY;
}

function readWishlist(storageKey) {
  try {
    let serialized = window.localStorage.getItem(storageKey);

    // Data created before wishlist scoping was introduced has no ownership
    // information. Discard it rather than exposing a former member's items
    // after logout as guest wishlist data.
    if (storageKey === GUEST_STORAGE_KEY) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const saved = JSON.parse(serialized);
    return Array.isArray(saved) ? normalizeWishlist(saved) : [];
  } catch {
    return [];
  }
}

function writeWishlist(storageKey, items) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { storageKey, items } }));
}

export function isWishlisted(wishlistId, memberId) {
  const productId = productIdFromWishlistItem({ wishlistId });
  return readWishlist(getStorageKey(memberId)).some((item) => item.productId === productId);
}

export function saveWishlistItem(item, memberId) {
  const productId = productIdFromWishlistItem(item);
  const wishlistItem = { ...item, productId, wishlistId: wishlistIdForProduct(productId) };
  const storageKey = getStorageKey(memberId);
  writeWishlist(storageKey, [wishlistItem, ...readWishlist(storageKey).filter((saved) => saved.productId !== productId)]);
}

export function removeWishlistItem(wishlistId, memberId) {
  const productId = productIdFromWishlistItem({ wishlistId });
  const storageKey = getStorageKey(memberId);
  writeWishlist(storageKey, readWishlist(storageKey).filter((item) => item.productId !== productId));
}

export function useWishlist(memberId) {
  const storageKey = useMemo(() => getStorageKey(memberId), [memberId]);
  const [wishlist, setWishlist] = useState(() => readWishlist(storageKey));
  const sync = useCallback((event) => {
    if (event?.detail?.storageKey && event.detail.storageKey !== storageKey) return;
    setWishlist(readWishlist(storageKey));
  }, [storageKey]);

  useEffect(() => {
    setWishlist(readWishlist(storageKey));
  }, [storageKey]);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [storageKey, sync]);

  return [wishlist, (item) => {
    if (isWishlisted(item.productId ?? item.wishlistId, memberId)) removeWishlistItem(item.productId ?? item.wishlistId, memberId);
    else saveWishlistItem(item, memberId);
  }];
}
