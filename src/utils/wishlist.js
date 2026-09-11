import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addMemberWishlistItem,
  getMemberWishlist,
  removeMemberWishlistItem,
} from '../api/wishlist';

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
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  return items.reduce((result, item) => {
    const product = item?.product && typeof item.product === 'object' ? item.product : item;
    const productId = productIdFromWishlistItem(product);
    if (!productId || seen.has(productId)) return result;
    seen.add(productId);
    result.push({
      ...product,
      ...item,
      productId,
      name: item?.name ?? item?.productName ?? product?.name,
      nameEn: item?.nameEn ?? item?.productNameEn ?? product?.nameEn,
      price: item?.price ?? item?.productPrice ?? product?.price,
      image: item?.image ?? item?.imageUrl ?? item?.productImage ?? product?.image,
      detailUrl: item?.detailUrl ?? item?.productUrl ?? product?.detailUrl,
      wishlistId: wishlistIdForProduct(productId),
    });
    return result;
  }, []);
}

function itemsFromApiResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.wishlist)) return payload.wishlist;
  if (Array.isArray(payload?.wishlistItems)) return payload.wishlistItems;
  if (Array.isArray(payload?.productIds)) return payload.productIds.map((productId) => ({ productId }));
  return [];
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

function hasMemberId(memberId) {
  return memberId !== undefined && memberId !== null && String(memberId) !== '';
}

function mergeWishlistItems(primary, secondary) {
  return normalizeWishlist([...primary, ...secondary]);
}

// Login can cause App and WishlistPage to mount at the same time. Reuse one
// request so guest items are not uploaded twice during that transition.
const memberSyncRequests = new Map();
const memberWriteRequests = new Map();

async function loadMemberWishlist(memberId) {
  const storageKey = getStorageKey(memberId);
  const guestItems = readWishlist(GUEST_STORAGE_KEY);
  // Do not let a page transition's GET race ahead of a just-triggered PUT/DELETE.
  await memberWriteRequests.get(String(memberId));
  const remotePayload = await getMemberWishlist(memberId);
  const remoteItems = normalizeWishlist(itemsFromApiResponse(remotePayload));
  const remoteIds = new Set(remoteItems.map((item) => item.productId));
  const guestOnlyItems = guestItems.filter((item) => !remoteIds.has(item.productId));

  await Promise.all(guestOnlyItems.map((item) => addMemberWishlistItem(memberId, item.productId)));
  const merged = mergeWishlistItems(guestOnlyItems, remoteItems);
  writeWishlist(storageKey, merged);
  if (guestOnlyItems.length > 0) writeWishlist(GUEST_STORAGE_KEY, []);
  return merged;
}

function syncMemberWishlist(memberId) {
  const key = String(memberId);
  if (!memberSyncRequests.has(key)) {
    const request = loadMemberWishlist(memberId).finally(() => memberSyncRequests.delete(key));
    memberSyncRequests.set(key, request);
  }
  return memberSyncRequests.get(key);
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
  const isMemberWishlist = hasMemberId(memberId);
  const sync = useCallback((event) => {
    if (event?.detail?.storageKey && event.detail.storageKey !== storageKey) return;
    setWishlist(readWishlist(storageKey));
  }, [storageKey]);

  useEffect(() => {
    let isActive = true;
    setWishlist(readWishlist(storageKey));

    if (isMemberWishlist) {
      syncMemberWishlist(memberId)
        .then((items) => {
          if (isActive) setWishlist(items);
        })
        .catch((error) => {
          // Keep the cached member list visible when the API is temporarily unavailable.
          console.error('회원 위시리스트를 불러오지 못했습니다.', error);
        });
    }

    return () => { isActive = false; };
  }, [isMemberWishlist, memberId, storageKey]);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [storageKey, sync]);

  const toggleWishlist = useCallback(async (item) => {
    const productId = productIdFromWishlistItem(item);
    if (!productId) return;
    const wasWishlisted = wishlist.some((saved) => saved.productId === productId);
    const normalizedItem = normalizeWishlist([item])[0];
    const nextWishlist = wasWishlisted
      ? wishlist.filter((saved) => saved.productId !== productId)
      : [normalizedItem, ...wishlist.filter((saved) => saved.productId !== productId)];

    // Guest mode remains local-only. Member mode uses an optimistic UI update,
    // then persists the same operation to the server.
    if (!isMemberWishlist) {
      if (wasWishlisted) removeWishlistItem(productId, memberId);
      else saveWishlistItem(item, memberId);
      return;
    }

    setWishlist(nextWishlist);
    writeWishlist(storageKey, nextWishlist);
    try {
      const memberKey = String(memberId);
      const writeRequest = wasWishlisted
        ? removeMemberWishlistItem(memberId, productId)
        : addMemberWishlistItem(memberId, productId);
      const trackedWriteRequest = writeRequest.finally(() => {
        if (memberWriteRequests.get(memberKey) === trackedWriteRequest) {
          memberWriteRequests.delete(memberKey);
        }
      });
      memberWriteRequests.set(memberKey, trackedWriteRequest);
      await writeRequest;
    } catch (error) {
      setWishlist(wishlist);
      writeWishlist(storageKey, wishlist);
      throw error;
    }
  }, [isMemberWishlist, memberId, storageKey, wishlist]);

  return [wishlist, toggleWishlist];
}
