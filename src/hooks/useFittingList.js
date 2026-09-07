import { useCallback, useEffect, useRef, useState } from 'react';
import { AR_INTERACTION_TYPES, postArInteraction } from '../api/arInteractions';
import { ko } from '../i18n/ko';

export function useFittingList(arSessionId) {
  const [fittingProductIds, setFittingProductIds] = useState(() => new Set());
  const [pendingProductIds, setPendingProductIds] = useState(() => new Set());
  const controllersRef = useRef(new Map());

  const requestFitting = useCallback(async (item) => {
    if (pendingProductIds.has(item.productId)) return;
    const wasFitting = fittingProductIds.has(item.productId);
    const nextFitting = !wasFitting;
    setFittingProductIds((ids) => {
      const next = new Set(ids);
      if (nextFitting) next.add(item.productId);
      else next.delete(item.productId);
      return next;
    });
    setPendingProductIds((ids) => new Set(ids).add(item.productId));
    controllersRef.current.get(item.productId)?.abort();
    const controller = new AbortController();
    controllersRef.current.set(item.productId, controller);

    try {
      await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: nextFitting ? AR_INTERACTION_TYPES.FITTING_ADD : AR_INTERACTION_TYPES.FITTING_REMOVE,
        signal: controller.signal,
      });
    } catch (interactionError) {
      if (interactionError?.name !== 'AbortError') {
        console.error(ko.errors.fittingInteractionLog, interactionError);
        setFittingProductIds((ids) => {
          const next = new Set(ids);
          if (wasFitting) next.add(item.productId);
          else next.delete(item.productId);
          return next;
        });
      }
    } finally {
      if (controllersRef.current.get(item.productId) === controller) controllersRef.current.delete(item.productId);
      setPendingProductIds((ids) => {
        const next = new Set(ids);
        next.delete(item.productId);
        return next;
      });
    }
  }, [arSessionId, fittingProductIds, pendingProductIds]);

  useEffect(
    () => () => controllersRef.current.forEach((controller) => controller.abort()),
    [],
  );
  const removeFittingProducts = useCallback((productIds) => {
    setFittingProductIds((ids) => {
      const next = new Set(ids);
      productIds.forEach((productId) => next.delete(productId));
      return next;
    });
  }, []);
  return { fittingProductIds, requestFitting, removeFittingProducts };
}
