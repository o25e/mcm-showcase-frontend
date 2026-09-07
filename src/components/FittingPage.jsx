import { useCallback, useEffect, useRef, useState } from 'react';
import { AR_INTERACTION_TYPES, postArInteraction } from '../api/arInteractions';
import { evaluateArSessionMessage } from '../api/arSessions';
import { API_BASE_URL } from '../api/config';
import { createAvatarLook, getRecommendations, refreshRecommendations } from '../api/recommendations';
import { getArCopy } from './arCopy';
import { getProductName, getProductNameLines } from '../utils/productName';
import { removeWishlistItem, saveWishlistItem, wishlistIdForProduct } from '../utils/wishlist';
import { ko } from '../i18n/ko';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
const categoryCodeMap = { Bags: 'bag', Tops: 'top', Bottoms: 'bottom', Shoes: 'shoes', Accessories: 'accessories' };
const avatarByGender = { FEMALE: '/assets/figma-fitting/model_f.png', MALE: '/assets/figma-fitting/model_m.png' };
const DEFAULT_COMMENTS = {
  ko: ko.fitting.intro,
  en: 'Discover your style.\nTry on the pieces that speak to you.',
};
const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';
const FITTING_ERROR_MESSAGE = ko.errors.fittingSave;

function resolveAvatarImageUrl(image) {
  if (typeof image !== 'string' || !image.trim()) return '';

  const trimmedImage = image.trim();
  if (trimmedImage.startsWith('/') && !trimmedImage.startsWith('//')) {
    return `${API_ASSET_BASE_URL}${trimmedImage}`;
  }

  return trimmedImage;
}

export default function FittingPage({ onFinish, arSessionId, gender, memberId = null, language = 'ko' }) {
  const t = getArCopy(language);
  const [category, setCategory] = useState('Bags');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const selectedAvatar = avatarByGender[gender] ?? avatarByGender.FEMALE;
  const [avatarImage, setAvatarImage] = useState(selectedAvatar);
  const [history, setHistory] = useState([]);
  const [noAvatarProduct, setNoAvatarProduct] = useState(null);
  const [comment, setComment] = useState(DEFAULT_COMMENTS[language] ?? DEFAULT_COMMENTS.ko);
  const [fittingProductIds, setFittingProductIds] = useState(() => new Set());
  const [fittingPendingIds, setFittingPendingIds] = useState(() => new Set());
  const [error, setError] = useState('');
  const [isInteractionPending, setIsInteractionPending] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const historyRef = useRef(null);
  const interactionRequestNoRef = useRef(0);
  const recommendationCacheRef = useRef(new Map());
  const recommendationRequestNoRef = useRef(0);
  const categoryRef = useRef('Bags');
  const recommendationSessionRef = useRef(arSessionId);
  const recommendationControllerRef = useRef(null);
  const interactionControllerRef = useRef(null);
  const fittingControllersRef = useRef(new Map());
  const wishlistRequestsRef = useRef(new Map());
  const wishlistStateRef = useRef(new Map());
  const selectedProduct = recommendedProducts[selected] ?? null;

  function abortRecommendationRequest() {
    recommendationControllerRef.current?.abort();
    recommendationControllerRef.current = null;
  }

  function startInteractionRequest() {
    interactionControllerRef.current?.abort();
    const controller = new AbortController();
    interactionControllerRef.current = controller;
    return controller;
  }

  const fetchRecommendations = useCallback(async (categoryName) => {
    const categoryCode = categoryCodeMap[categoryName];
    if (!Number.isFinite(arSessionId) || !categoryCode) return;

    const requestNo = ++recommendationRequestNoRef.current;
    abortRecommendationRequest();
    const controller = new AbortController();
    recommendationControllerRef.current = controller;

    try {
      setError('');

      const data = await getRecommendations(arSessionId, categoryCode, controller.signal);
      if (recommendationSessionRef.current !== arSessionId) return;

      const products = Array.isArray(data.products) ? data.products : [];
      recommendationCacheRef.current.set(categoryName, products);

      // Ignore responses from an old category/session request.
      if (requestNo !== recommendationRequestNoRef.current || categoryRef.current !== categoryName) return;

      setRecommendedProducts(products);
      setSelected(0);
    } catch (recommendationError) {
      if (recommendationError?.name === 'AbortError') return;
      console.error(ko.errors.recommendationLog, recommendationError);
      if (requestNo !== recommendationRequestNoRef.current || categoryRef.current !== categoryName) return;

      setError(ko.errors.recommendation);
      setRecommendedProducts([]);
    }
  }, [arSessionId]);

  useEffect(() => {
    setAvatarImage(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    recommendationSessionRef.current = arSessionId;
    recommendationCacheRef.current = new Map();
    recommendationRequestNoRef.current += 1;
    categoryRef.current = 'Bags';
    setCategory('Bags');
    setRecommendedProducts([]);
    setSelected(0);
  }, [arSessionId]);

  useEffect(() => {
    if (Number.isFinite(arSessionId)) fetchRecommendations('Bags');
  }, [arSessionId, fetchRecommendations]);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = 0;
  }, [history.length]);

  useEffect(() => {
    if (!isGeneratingAvatar) return undefined;

    const controller = new AbortController();

    async function generateAvatarLook() {
      try {
        const data = await createAvatarLook(arSessionId, controller.signal);
        const image = data.avatarImageUrl || data.avatarImage || data.imageUrl;
        if (!image || !data.styleProfileId) throw new Error('Avatar look response is missing image or style profile');

        const avatarImageUrl = resolveAvatarImageUrl(image);
        onFinish?.({
          ...data,
          avatarImageUrl,
        });
      } catch (generationError) {
        if (generationError.name !== 'AbortError') {
          console.error(ko.errors.avatarGenerationLog, generationError);
          setError(ko.errors.avatarGeneration);
          setIsGeneratingAvatar(false);
        }
      }
    }

    generateAvatarLook();
    return () => controller.abort();
  }, [arSessionId, isGeneratingAvatar, onFinish]);

  function handleCategoryClick(categoryName) {
    abortRecommendationRequest();
    categoryRef.current = categoryName;
    setCategory(categoryName);
    setSelected(0);
    setOpen(false);
    setError('');

    if (recommendationCacheRef.current.has(categoryName)) {
      setRecommendedProducts(recommendationCacheRef.current.get(categoryName));
      recommendationRequestNoRef.current += 1;
      return;
    }

    setRecommendedProducts([]);
    fetchRecommendations(categoryName);
  }

  async function handleRefresh() {
    const categoryCode = categoryCodeMap[category];
    if (!Number.isFinite(arSessionId) || !categoryCode) return;

    const refreshCategory = category;
    const requestNo = ++recommendationRequestNoRef.current;
    abortRecommendationRequest();
    const controller = new AbortController();
    recommendationControllerRef.current = controller;

    try {
      setError('');

      const data = await refreshRecommendations(arSessionId, categoryCode, controller.signal);
      if (!Array.isArray(data.products)) throw new Error('Recommendations refresh returned an invalid products value');
      if (recommendationSessionRef.current !== arSessionId) return;

      const products = [...data.products];
      recommendationCacheRef.current.set(refreshCategory, products);

      // Keep the refreshed list cached even if the user changed categories while waiting,
      // but do not replace the currently visible category's list.
      if (requestNo !== recommendationRequestNoRef.current || categoryRef.current !== refreshCategory) return;

      setRecommendedProducts(products);
      setSelected(0);
      setOpen(false);
    } catch (refreshError) {
      if (refreshError?.name === 'AbortError') return;
      console.error(ko.errors.recommendationRefreshLog, refreshError);
      if (requestNo === recommendationRequestNoRef.current && categoryRef.current === refreshCategory) {
        setError(ko.errors.recommendationRefresh);
      }
    }
  }

  useEffect(() => () => {
    abortRecommendationRequest();
    interactionControllerRef.current?.abort();
    fittingControllersRef.current.forEach((controller) => controller.abort());
    wishlistRequestsRef.current.forEach(({ controller }) => controller.abort());
  }, []);

  function selectProduct(product, index) {
    setSelected(index);
    setOpen(true);
    setError('');
  }

  function preloadAvatarImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(imageUrl);
      image.onerror = () => reject(new Error('Avatar image failed to load'));
      image.src = imageUrl;
    });
  }

  async function applyAvatarImage(response, requestNo) {
    if (!response?.avatarImageUrl || requestNo !== interactionRequestNoRef.current) return null;

    const imageUrl = resolveAvatarImageUrl(response.avatarImageUrl);
    if (!imageUrl) return null;

    const version = response.sequenceNo ?? Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    const imageSrc = `${imageUrl}${separator}v=${encodeURIComponent(version)}`;
    await preloadAvatarImage(imageSrc);

    if (requestNo !== interactionRequestNoRef.current) return null;
    setAvatarImage(imageSrc);
    return imageSrc;
  }

  function getItemsToDeselect(targetCategory, targetProductId) {
    return history.filter((item) => {
      if (item.active === false || item.productId === targetProductId) return false;

      const isFemaleBagMode = gender === 'FEMALE' && targetCategory === 'Bags';
      const isFemaleClothingMode = gender === 'FEMALE' && targetCategory !== 'Bags';

      if (isFemaleBagMode) return item.category !== 'Bags';
      if (isFemaleClothingMode) return item.category === 'Bags' || item.category === targetCategory;
      return item.category === targetCategory;
    });
  }

  async function fitSelectedProduct() {
    if (!selectedProduct || !Number.isFinite(arSessionId)) return;

    const product = selectedProduct;
    const isDeselect = history.some((item) => item.productId === product.productId && item.active !== false);
    // 카테고리별로 한 상품만 착용할 수 있으므로, 같은 카테고리의 다른 상품을 선택하면
    // Keep selections from different categories (for example, a male top and bottom).
    // Only replace the currently fitted product(s) in the same category.
    const previousFittingItems = !isDeselect ? getItemsToDeselect(category, product.productId) : [];
    const requestNo = interactionRequestNoRef.current + 1;
    interactionRequestNoRef.current = requestNo;
    const controller = startInteractionRequest();
    setIsInteractionPending(true);
    setError('');

    try {
      for (const previousFittingItem of previousFittingItems) {
        await postArInteraction({
          arSessionId,
          productId: previousFittingItem.productId,
          interactionType: AR_INTERACTION_TYPES.PRODUCT_DESELECT,
          signal: controller.signal,
        });
      }

      const response = await postArInteraction({
        arSessionId,
        productId: product.productId,
        interactionType: isDeselect ? AR_INTERACTION_TYPES.PRODUCT_DESELECT : AR_INTERACTION_TYPES.PRODUCT_SELECT,
        signal: controller.signal,
      });

      const nextAvatarImage = await applyAvatarImage(response, requestNo);
      if (requestNo !== interactionRequestNoRef.current) return;

      // 상품을 새로 피팅하면 기존 아바타 구성은 해제된다. 피팅 아이콘 상태도
      // 아바타 상태와 함께 초기화하지 않으면 이전 카테고리 상품이 계속
      // '피팅 취소' 상태로 남아 다시 피팅할 수 없게 된다.
      const deactivatedProductIds = isDeselect
        ? [product.productId]
        : previousFittingItems.map((item) => item.productId);
      if (deactivatedProductIds.length > 0) {
        setFittingProductIds((ids) => {
          const next = new Set(ids);
          deactivatedProductIds.forEach((productId) => next.delete(productId));
          return next;
        });
      }

      if (!isDeselect && response?.avatarImageUrl === null) {
        setNoAvatarProduct(product);
      }

      void evaluateArSessionMessage(arSessionId, language, controller.signal)
        .then((result) => {
          if (result?.triggered === true) {
            if (typeof result.message === 'string') {
              setComment(result.message);
            }
          }
        })
        .catch((evaluationError) => {
          if (evaluationError?.name === 'AbortError') return;
          console.error(ko.errors.commentEvaluationLog, evaluationError);
        });

      if (isDeselect) {
        // 히스토리에는 남기고 현재 착용 상태만 해제한다.
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
            // This is a snapshot of the new fitting, not the user's current
            // wishlist state. A new fitting starts with its heart OFF.
            wishlisted: false,
            wishlistId: wishlistIdForProduct(product.productId),
          },
          ...items
            .filter((item) => item.productId !== product.productId)
            .map((item) => (
              previousFittingItems.some((previousItem) => previousItem.productId === item.productId)
                ? { ...item, active: false }
                : item
            )),
        ]);
      } else if (previousFittingItems.length > 0) {
        // 새 상품의 아바타 이미지가 없더라도, 앞선 해제 요청은 성공했으므로
        // 기존 상품을 히스토리에 남긴 채 착용 상태만 해제한다.
        setHistory((items) => items.map((item) => (
          previousFittingItems.some((previousItem) => previousItem.productId === item.productId)
            ? { ...item, active: false }
            : item
        )));
      }

      setOpen(false);
    } catch (fitError) {
      if (fitError?.name === 'AbortError') return;
      if (requestNo === interactionRequestNoRef.current) {
        console.error(ko.errors.productInteractionLog, fitError);
        setError(FITTING_ERROR_MESSAGE);
      }
    } finally {
      if (requestNo === interactionRequestNoRef.current) setIsInteractionPending(false);
    }
  }

  async function handleHistoryProductClick(item) {
    if (!item) return;

    const activeHistoryItem = history.find((historyItem) => (
      historyItem.active !== false && historyItem.productId === item.productId
    ));

    // 이미 현재 피팅 중인 상품이면 화면만 전환하고 PRODUCT_SELECT를 중복 전송하지 않는다.
    if (activeHistoryItem?.productId === item.productId) {
      if (!item.avatarImageUrl) {
        setNoAvatarProduct(item);
      } else {
        setAvatarImage(item.avatarImage);
      }
      return;
    }

    const requestNo = interactionRequestNoRef.current + 1;
    interactionRequestNoRef.current = requestNo;
    const controller = startInteractionRequest();
    setIsInteractionPending(true);
    setError('');

    try {
      const itemsToDeselect = getItemsToDeselect(item.category, item.productId);

      for (const itemToDeselect of itemsToDeselect) {
        await postArInteraction({
          arSessionId,
          productId: itemToDeselect.productId,
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

      if (requestNo !== interactionRequestNoRef.current) return;

      // A history selection can acknowledge successfully without returning a new
      // image. In that case, keep the current composite avatar instead of
      // restoring the stale snapshot stored on the history item.
      const nextAvatarImage = response?.avatarImageUrl
        ? await applyAvatarImage(response, requestNo)
        : avatarImage;

      if (requestNo !== interactionRequestNoRef.current) return;

      if (nextAvatarImage) setAvatarImage(nextAvatarImage);
      if (!nextAvatarImage && !item.avatarImageUrl) setNoAvatarProduct(item);
      setHistory((items) => items.map((historyItem) => (
        historyItem.productId === item.productId
          ? { ...historyItem, active: true, avatarImage: nextAvatarImage || historyItem.avatarImage }
          : itemsToDeselect.some((itemToDeselect) => itemToDeselect.productId === historyItem.productId)
            ? { ...historyItem, active: false }
            : historyItem
      )));
      setOpen(false);
    } catch (interactionError) {
      if (interactionError?.name === 'AbortError') return;
      if (requestNo === interactionRequestNoRef.current) {
        console.error('AR history PRODUCT_SELECT interaction error:', interactionError);
        setError(FITTING_ERROR_MESSAGE);
      }
    } finally {
      if (requestNo === interactionRequestNoRef.current) setIsInteractionPending(false);
    }
  }

  async function toggleWishlist(item) {
    const requestKey = item.id;
    const previousRequest = wishlistRequestsRef.current.get(requestKey);
    previousRequest?.controller.abort();
    const previousWishlisted = wishlistStateRef.current.has(requestKey)
      ? wishlistStateRef.current.get(requestKey)
      : item.wishlisted;
    const nextWishlisted = !previousWishlisted;
    const requestNo = (previousRequest?.requestNo ?? 0) + 1;
    const controller = new AbortController();
    wishlistRequestsRef.current.set(requestKey, { requestNo, controller });
    wishlistStateRef.current.set(requestKey, nextWishlisted);
    const wishlistItem = {
      productId: item.productId,
      wishlistId: wishlistIdForProduct(item.productId),
      source: 'ar-fitting',
      name: item.name || item.nameEn,
      nameEn: item.nameEn,
      price: item.price,
      image: item.imageUrl,
    };

    setHistory((items) =>
      items.map((historyItem) =>
        historyItem.id === item.id ? { ...historyItem, wishlisted: nextWishlisted } : historyItem
      )
    );

    try {
      await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: nextWishlisted ? AR_INTERACTION_TYPES.WISHLIST_ADD : AR_INTERACTION_TYPES.WISHLIST_REMOVE,
        signal: controller.signal,
      });
      const latestRequest = wishlistRequestsRef.current.get(requestKey);
      if (latestRequest?.requestNo !== requestNo) return;
      if (nextWishlisted) saveWishlistItem(wishlistItem, memberId);
      else removeWishlistItem(wishlistItem.productId, memberId);
    } catch (interactionError) {
      const latestRequest = wishlistRequestsRef.current.get(requestKey);
      if (latestRequest?.requestNo !== requestNo) return;
      if (interactionError?.name === 'AbortError') return;
      console.error(ko.errors.wishlistInteractionLog, interactionError);

      wishlistStateRef.current.set(requestKey, previousWishlisted);

      setHistory((items) =>
        items.map((historyItem) =>
          historyItem.id === item.id ? { ...historyItem, wishlisted: !nextWishlisted } : historyItem
        )
      );
    }
  }

  async function requestFitting(item) {
    if (fittingPendingIds.has(item.productId)) return;

    const wasFitting = fittingProductIds.has(item.productId);
    const nextFitting = !wasFitting;

    setFittingProductIds((ids) => {
      const next = new Set(ids);
      if (nextFitting) next.add(item.productId);
      else next.delete(item.productId);
      return next;
    });

    setFittingPendingIds((ids) => new Set(ids).add(item.productId));
    const previousController = fittingControllersRef.current.get(item.productId);
    previousController?.abort();
    const controller = new AbortController();
    fittingControllersRef.current.set(item.productId, controller);

    try {
      await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: nextFitting
          ? AR_INTERACTION_TYPES.FITTING_ADD
          : AR_INTERACTION_TYPES.FITTING_REMOVE,
        signal: controller.signal,
      });
    } catch (interactionError) {
      if (interactionError?.name === 'AbortError') return;
      console.error(ko.errors.fittingInteractionLog, interactionError);

      setFittingProductIds((ids) => {
        const next = new Set(ids);
        if (wasFitting) next.add(item.productId);
        else next.delete(item.productId);
        return next;
      });
    } finally {
      if (fittingControllersRef.current.get(item.productId) === controller) {
        fittingControllersRef.current.delete(item.productId);
      }
      setFittingPendingIds((ids) => {
        const next = new Set(ids);
        next.delete(item.productId);
        return next;
      });
    }
  }

  if (isGeneratingAvatar) {
    return (
      <main className="avatar-generating-page" aria-labelledby="avatar-generating-title">
        <img className="avatar-generating-page__background" src="/assets/ar-background.png" alt="" aria-hidden="true" />
        <div className="avatar-generating-page__shade" />

        <nav className="ar-page__progress" aria-label="AR fitting progress">
          {steps.map((step) => <span className="active" key={step}>{step}</span>)}
        </nav>

        <div className="ar-page__progress-track ar-page__progress-track--avatar" aria-hidden="true"><span /></div>
        <span className="avatar-generating-page__divider" aria-hidden="true" />
        <p id="avatar-generating-title" className="avatar-generating-page__message">{t.avatarGenerating}</p>
        <img className="avatar-generating-page__wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" />
      </main>
    );
  }

  const visibleHistory = [
    ...history,
    ...Array.from({ length: Math.max(0, 3 - history.length) }, () => null),
  ];

  return (
    <section className={`fitting-page ${language === 'en' ? 'fitting-page--en' : ''}`} aria-labelledby="fitting-page-title">
      <img className="fitting-page__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" />
      <div className="fitting-page__shade" />

      <nav className="fitting-page__steps" aria-label="AR fitting progress">
        {steps.map((step, index) => <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>)}
      </nav>
      <div className="fitting-page__track"><span /></div>

      <h1 id="fitting-page-title" className="fitting-page__history-title">History</h1>

      <div className="fitting-page__history" ref={historyRef} aria-label={ko.fitting.history}>
        {visibleHistory.map((item, index) => (
          <button
            className={`fitting-page__history-card ${item ? 'active' : ''}`}
            type="button"
            key={item ? item.id : `history-empty-${index}`}
            onClick={() => handleHistoryProductClick(item)}
            disabled={!item}
          >
            {item && (
              <img
                className="fitting-page__history-heart"
                src={item.wishlisted ? '/assets/product-detail-heart-click.png' : '/assets/product-detail-heart.png'}
                alt=""
                onClick={(event) => {
                  event.stopPropagation();
                  toggleWishlist(item);
                }}
              />
            )}

            {item && (
              <img
                className="fitting-page__history-hanger"
                src={fittingProductIds.has(item.productId) ? '/assets/icon-cloth-click.png' : '/assets/product-detail-cloth.png'}
                alt=""
                onClick={(event) => {
                  event.stopPropagation();
                  requestFitting(item);
                }}
              />
            )}

            {item && <img className="fitting-page__history-product" src={item.imageUrl} alt={`${getProductName(item, language)} ${ko.fitting.historyAlt}`} />}
          </button>
        ))}
      </div>

      <span className="fitting-page__history-rule" aria-hidden="true" />

      <div className="fitting-page__comment">
        <h2>Comment</h2>
        {comment && (
          <p>
            {comment.split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}
      </div>

      <span className="fitting-page__comment-rule" aria-hidden="true" />

      <img className={`fitting-page__avatar ${gender === 'MALE' ? 'fitting-page__avatar--male' : ''}`} src={avatarImage} alt="fitting avatar" />

      <button
        className={`fitting-page__finish ${language === 'en' ? 'fitting-page__finish--english' : ''}`}
        type="button"
        onClick={() => setIsGeneratingAvatar(true)}
      >
        {t.fittingFinish}
      </button>

      <section className="fitting-page__catalog" aria-label={ko.fitting.catalog}>
        <div className="fitting-page__tabs" role="tablist">
          {categories.map((item) => (
            <button
              className={category === item ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={category === item}
              onClick={() => handleCategoryClick(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <span className="fitting-page__catalog-rule" />

        <div className="fitting-page__product-grid">
          {recommendedProducts.map((product, index) => (
            <button
              className={`fitting-page__product ${selected === index ? 'selected' : ''}`}
              type="button"
              onClick={() => selectProduct(product, index)}
              key={product.productId}
              aria-label={getProductName(product, language)}
            >
              <img src={product.imageUrl} alt={getProductName(product, language)} />
            </button>
          ))}
        </div>

        <span className="fitting-page__product-bottom-rule" />

        <button className="fitting-page__refresh" type="button" onClick={handleRefresh}>
          <img src="/assets/figma-fitting-refresh.svg" alt={ko.fitting.refresh} />
        </button>
      </section>

      {open && selectedProduct && (
        <div className="fitting-product-frame-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <article
            className="fitting-product-frame"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="fitting-product-frame__close" type="button" onClick={() => setOpen(false)} aria-label={ko.fitting.close}>×</button>
            <img className="fitting-product-frame__image" src={selectedProduct.imageUrl} alt={getProductName(selectedProduct, language)} />
            <h2>
              {getProductNameLines(selectedProduct, language).map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
            <p className="fitting-product-frame__price">₩ {selectedProduct.price.toLocaleString()}</p>
            <p className="fitting-product-frame__color">Color</p>

            <div className="fitting-product-frame__swatches">
              <span /><span /><span /><span />
            </div>

            {error && <p role="alert" className="fitting-error">{error}</p>}

            <button className="fitting-product-frame__fit" type="button" onClick={fitSelectedProduct} disabled={isInteractionPending}>
              {history.some((item) => item.productId === selectedProduct.productId && item.active !== false)
                ? (language === 'en' ? 'Remove' : ko.fitting.remove)
                : (language === 'en' ? 'Try on' : ko.fitting.tryOn)}
            </button>
          </article>
        </div>
      )}

      {noAvatarProduct && (
        <div className="fitting-no-avatar-modal" role="presentation" onClick={() => setNoAvatarProduct(null)}>
          <div
            className="fitting-no-avatar-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fitting-no-avatar-title"
            onClick={(event) => event.stopPropagation()}
          >
            <img className="fitting-no-avatar-modal__logo" src="/assets/MCM-logo.png" alt="MCM" />
            <p id="fitting-no-avatar-title">{ko.fitting.noAvatar}<br />{ko.fitting.noAvatarHelp}</p>
            <button type="button" onClick={() => setNoAvatarProduct(null)}>{ko.fitting.confirm}</button>
          </div>
        </div>
      )}
    </section>
  );
}
