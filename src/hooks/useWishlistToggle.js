import { useCallback, useEffect, useRef, useState } from 'react';
import { AR_INTERACTION_TYPES, postArInteraction } from '../api/arInteractions';
import { removeWishlistItem, saveWishlistItem, wishlistIdForProduct } from '../utils/wishlist';
import { ko } from '../i18n/ko';

export function useWishlistToggle({ arSessionId, memberId, onChange }) {
  const [error, setError] = useState('');
  const requestsRef = useRef(new Map());
  const stateRef = useRef(new Map());

  const toggleWishlist = useCallback(async (item) => {
    const requestKey = item.id;
    const previousRequest = requestsRef.current.get(requestKey);
    previousRequest?.controller.abort();
    const previousValue = stateRef.current.has(requestKey)
      ? stateRef.current.get(requestKey)
      : item.wishlisted;
    const nextValue = !previousValue;
    const requestNo = (previousRequest?.requestNo ?? 0) + 1;
    const controller = new AbortController();
    requestsRef.current.set(requestKey, { requestNo, controller });
    stateRef.current.set(requestKey, nextValue);
    onChange(item.id, nextValue);

    try {
      await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: nextValue ? AR_INTERACTION_TYPES.WISHLIST_ADD : AR_INTERACTION_TYPES.WISHLIST_REMOVE,
        signal: controller.signal,
      });
      const latest = requestsRef.current.get(requestKey);
      if (latest?.requestNo !== requestNo) return;
      const wishlistItem = {
        productId: item.productId,
        wishlistId: wishlistIdForProduct(item.productId),
        source: 'ar-fitting',
        name: item.name || item.nameEn,
        nameEn: item.nameEn,
        price: item.price,
        image: item.imageUrl,
      };
      if (nextValue) saveWishlistItem(wishlistItem, memberId);
      else removeWishlistItem(item.productId, memberId);
    } catch (interactionError) {
      const latest = requestsRef.current.get(requestKey);
      if (latest?.requestNo !== requestNo || interactionError?.name === 'AbortError') return;
      console.error(ko.errors.wishlistInteractionLog, interactionError);
      stateRef.current.set(requestKey, previousValue);
      onChange(item.id, previousValue);
      setError(ko.errors.fittingSave);
    }
  }, [arSessionId, memberId, onChange]);

  useEffect(() => () => {
    requestsRef.current.forEach(({ controller }) => controller.abort());
  }, []);

  return { toggleWishlist, error };
}
