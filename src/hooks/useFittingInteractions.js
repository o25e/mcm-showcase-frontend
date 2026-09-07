import { useCallback, useEffect, useRef, useState } from 'react';
import { AR_INTERACTION_TYPES, postArInteraction } from '../api/arInteractions';
import { evaluateArSessionMessage } from '../api/arSessions';
import { resolveAvatarImageUrl } from './useAvatarGeneration';
import { useWishlistToggle } from './useWishlistToggle';
import { useFittingList } from './useFittingList';
import { wishlistIdForProduct } from '../utils/wishlist';
import { ko } from '../i18n/ko';

const FITTING_ERROR_MESSAGE = ko.errors.fittingSave;

export function useFittingInteractions({
  arSessionId,
  gender,
  language,
  memberId,
  avatarImage,
  setAvatarImage,
}) {
  const [history, setHistory] = useState([]);
  const [noAvatarProduct, setNoAvatarProduct] = useState(null);
  const [comment, setComment] = useState(ko.fitting.intro);
  const [error, setError] = useState('');
  const [isInteractionPending, setIsInteractionPending] = useState(false);
  const interactionNoRef = useRef(0);
  const interactionControllerRef = useRef(null);

  useEffect(() => {
    setComment(
      language === 'en'
        ? 'Discover your style.\nTry on the pieces that speak to you.'
        : ko.fitting.intro,
    );
  }, [language]);

  const updateWishlistState = useCallback((itemId, wishlisted) => {
    setHistory((items) => items.map((item) => (
      item.id === itemId ? { ...item, wishlisted } : item
    )));
  }, []);

  const wishlist = useWishlistToggle({
    arSessionId,
    memberId,
    onChange: updateWishlistState,
  });
  const fittingList = useFittingList(arSessionId);

  const startRequest = useCallback(() => {
    interactionControllerRef.current?.abort();
    const controller = new AbortController();
    interactionControllerRef.current = controller;
    return controller;
  }, []);

  const preloadAvatar = (imageUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(imageUrl);
    image.onerror = () => reject(new Error('Avatar image failed to load'));
    image.src = imageUrl;
  });

  const applyAvatar = async (response, requestNo) => {
    if (!response?.avatarImageUrl || requestNo !== interactionNoRef.current) return null;

    const imageUrl = resolveAvatarImageUrl(response.avatarImageUrl);
    if (!imageUrl) return null;

    const separator = imageUrl.includes('?') ? '&' : '?';
    const imageSrc = `${imageUrl}${separator}v=${encodeURIComponent(
      response.sequenceNo ?? Date.now(),
    )}`;
    await preloadAvatar(imageSrc);

    if (requestNo !== interactionNoRef.current) return null;
    setAvatarImage(imageSrc);
    return imageSrc;
  };

  const getItemsToDeselect = useCallback((targetCategory, targetProductId) => (
    history.filter((item) => {
      if (item.active === false || item.productId === targetProductId) return false;
      if (gender === 'FEMALE' && targetCategory === 'Bags') return item.category !== 'Bags';
      if (gender === 'FEMALE' && targetCategory !== 'Bags') {
        return item.category === 'Bags' || item.category === targetCategory;
      }
      return item.category === targetCategory;
    })
  ), [gender, history]);

  const fitProduct = useCallback(async (product, category) => {
    if (!product || !Number.isFinite(arSessionId)) return false;

    const isDeselect = history.some(
      (item) => item.productId === product.productId && item.active !== false,
    );
    const previousItems = isDeselect
      ? []
      : getItemsToDeselect(category, product.productId);
    const requestNo = ++interactionNoRef.current;
    const controller = startRequest();

    setIsInteractionPending(true);
    setError('');

    try {
      for (const item of previousItems) {
        await postArInteraction({
          arSessionId,
          productId: item.productId,
          interactionType: AR_INTERACTION_TYPES.PRODUCT_DESELECT,
          signal: controller.signal,
        });
      }

      const response = await postArInteraction({
        arSessionId,
        productId: product.productId,
        interactionType: isDeselect
          ? AR_INTERACTION_TYPES.PRODUCT_DESELECT
          : AR_INTERACTION_TYPES.PRODUCT_SELECT,
        signal: controller.signal,
      });
      const nextAvatarImage = await applyAvatar(response, requestNo);

      if (requestNo !== interactionNoRef.current) return false;

      const deactivatedIds = isDeselect
        ? [product.productId]
        : previousItems.map((item) => item.productId);
      fittingList.removeFittingProducts(deactivatedIds);

      if (!isDeselect && response?.avatarImageUrl === null) {
        setNoAvatarProduct(product);
      }

      void evaluateArSessionMessage(arSessionId, language, controller.signal)
        .then((result) => {
          if (result?.triggered && typeof result.message === 'string') {
            setComment(result.message);
          }
        })
        .catch((evaluationError) => {
          if (evaluationError?.name !== 'AbortError') {
            console.error(ko.errors.commentEvaluationLog, evaluationError);
          }
        });

      if (isDeselect) {
        setHistory((items) => items.map((item) => (
          item.productId === product.productId ? { ...item, active: false } : item
        )));
      } else if (response?.avatarImageUrl) {
        setHistory((items) => [
          {
            id: `${product.productId}-${Date.now()}`,
            productId: product.productId,
            category,
            active: true,
            name: product.name,
            nameEn: product.nameEn,
            imageUrl: product.imageUrl,
            avatarImage: nextAvatarImage || avatarImage,
            avatarImageUrl: response.avatarImageUrl,
            wishlisted: false,
            wishlistId: wishlistIdForProduct(product.productId),
          },
          ...items
            .filter((item) => item.productId !== product.productId)
            .map((item) => previousItems.some(
              (previous) => previous.productId === item.productId,
            ) ? { ...item, active: false } : item),
        ]);
      } else if (previousItems.length) {
        setHistory((items) => items.map((item) => (
          previousItems.some((previous) => previous.productId === item.productId)
            ? { ...item, active: false }
            : item
        )));
      }

      return true;
    } catch (fitError) {
      if (fitError?.name !== 'AbortError' && requestNo === interactionNoRef.current) {
        console.error(ko.errors.productInteractionLog, fitError);
        setError(FITTING_ERROR_MESSAGE);
      }
      return false;
    } finally {
      if (requestNo === interactionNoRef.current) setIsInteractionPending(false);
    }
  }, [
    arSessionId,
    avatarImage,
    fittingList,
    getItemsToDeselect,
    history,
    language,
    setAvatarImage,
    startRequest,
  ]);

  const selectHistory = useCallback(async (item) => {
    if (!item) return;

    const active = history.find((historyItem) => (
      historyItem.active !== false && historyItem.productId === item.productId
    ));
    if (active) {
      if (!item.avatarImageUrl) setNoAvatarProduct(item);
      else setAvatarImage(item.avatarImage);
      return;
    }

    const requestNo = ++interactionNoRef.current;
    const controller = startRequest();
    setIsInteractionPending(true);
    setError('');

    try {
      const itemsToDeselect = getItemsToDeselect(item.category, item.productId);
      for (const previous of itemsToDeselect) {
        await postArInteraction({
          arSessionId,
          productId: previous.productId,
          interactionType: AR_INTERACTION_TYPES.PRODUCT_DESELECT,
          signal: controller.signal,
        });
      }

      const response = await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: AR_INTERACTION_TYPES.PRODUCT_SELECT,
        signal: controller.signal,
      });
      if (requestNo !== interactionNoRef.current) return;

      const nextAvatarImage = response?.avatarImageUrl
        ? await applyAvatar(response, requestNo)
        : avatarImage;
      if (!nextAvatarImage && !item.avatarImageUrl) setNoAvatarProduct(item);

      setHistory((items) => items.map((historyItem) => (
        historyItem.productId === item.productId
          ? { ...historyItem, active: true, avatarImage: nextAvatarImage || historyItem.avatarImage }
          : itemsToDeselect.some((previous) => previous.productId === historyItem.productId)
            ? { ...historyItem, active: false }
            : historyItem
      )));
    } catch (interactionError) {
      if (interactionError?.name !== 'AbortError' && requestNo === interactionNoRef.current) {
        console.error('AR history PRODUCT_SELECT interaction error:', interactionError);
        setError(FITTING_ERROR_MESSAGE);
      }
    } finally {
      if (requestNo === interactionNoRef.current) setIsInteractionPending(false);
    }
  }, [arSessionId, avatarImage, getItemsToDeselect, history, setAvatarImage, startRequest]);

  useEffect(() => () => interactionControllerRef.current?.abort(), []);

  return {
    history,
    comment,
    noAvatarProduct,
    setNoAvatarProduct,
    error: error || wishlist.error,
    isInteractionPending,
    fittingProductIds: fittingList.fittingProductIds,
    fitProduct,
    selectHistory,
    toggleWishlist: wishlist.toggleWishlist,
    requestFitting: fittingList.requestFitting,
  };
}
