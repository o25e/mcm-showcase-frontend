import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mcm.wishlist';
const EVENT_NAME = 'mcm:wishlist-changed';

function readWishlist() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
}

export function isWishlisted(wishlistId) {
  return readWishlist().some((item) => item.wishlistId === String(wishlistId));
}

export function saveWishlistItem(item) {
  const wishlistItem = { ...item, wishlistId: String(item.wishlistId) };
  writeWishlist([wishlistItem, ...readWishlist().filter((saved) => saved.wishlistId !== wishlistItem.wishlistId)]);
}

export function removeWishlistItem(wishlistId) {
  writeWishlist(readWishlist().filter((item) => item.wishlistId !== String(wishlistId)));
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
    if (isWishlisted(item.wishlistId)) removeWishlistItem(item.wishlistId);
    else saveWishlistItem(item);
  }];
}
