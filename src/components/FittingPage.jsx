import { useCallback, useEffect, useRef, useState } from 'react';
import { AR_INTERACTION_TYPES, postArInteraction } from '../api/arInteractions';
import { evaluateArSessionMessage } from '../api/arSessions';
import { API_BASE_URL } from '../api/config';
import { getArCopy } from './arCopy';
import { getProductName, getProductNameLines } from '../utils/productName';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
const categoryCodeMap = { Bags: 'bag', Tops: 'top', Bottoms: 'bottom', Shoes: 'shoes', Accessories: 'accessories' };
const avatarByGender = { FEMALE: '/assets/figma-fitting/model_f.png', MALE: '/assets/figma-fitting/model_m.png' };
const DEFAULT_COMMENTS = {
  ko: '지금부터 당신만의 스타일을 찾아보세요.\n마음이 가는 제품을 자유롭게 피팅할 수 있어요.',
  en: 'Discover your style.\nTry on the pieces that speak to you.',
};
const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';
const FITTING_ERROR_MESSAGE = '피팅 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';

function resolveAvatarImageUrl(image) {
  if (typeof image !== 'string' || !image.trim()) return '';

  const trimmedImage = image.trim();
  if (trimmedImage.startsWith('/') && !trimmedImage.startsWith('//')) {
    return `${API_ASSET_BASE_URL}${trimmedImage}`;
  }

  return trimmedImage;
}

export default function FittingPage({ onFinish, arSessionId, gender, language = 'ko' }) {
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
  const [fittingRecordedProductIds, setFittingRecordedProductIds] = useState(() => new Set());
  const [fittingPendingIds, setFittingPendingIds] = useState(() => new Set());
  const [error, setError] = useState('');
  const [isInteractionPending, setIsInteractionPending] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const historyRef = useRef(null);
  const interactionRequestNoRef = useRef(0);
  const selectedProduct = recommendedProducts[selected] ?? null;

  const fetchRecommendations = useCallback(async (categoryName) => {
    const categoryCode = categoryCodeMap[categoryName];
    if (!Number.isFinite(arSessionId) || !categoryCode) return;

    try {
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Recommendations request failed (${response.status})`);

      const data = await response.json();
      setRecommendedProducts(Array.isArray(data.products) ? data.products : []);
      setSelected(0);
    } catch (recommendationError) {
      console.error('추천 상품 조회 오류:', recommendationError);
      setError('추천 상품을 불러오지 못했습니다.');
      setRecommendedProducts([]);
    }
  }, [arSessionId]);

  useEffect(() => {
    setAvatarImage(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (Number.isFinite(arSessionId)) fetchRecommendations('Bags');
  }, [arSessionId, fetchRecommendations]);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = 0;
  }, [history.length]);

  useEffect(() => {
    if (!isGeneratingAvatar) return undefined;

    const controller = new AbortController();

    async function createAvatarLook() {
      try {
        // [테스트용] 미리 생성된 아바타 이미지를 조회합니다.
        // const response = await fetch(`${API_BASE_URL}/api/test/avatar-images/latest`, {
        //   method: 'GET',
        //   headers: { Accept: 'application/json' },
        //   signal: controller.signal,
        // });

        // [실제 생성용] 실제 아바타 생성 API
        const response = await fetch(`${API_BASE_URL}/api/recommendations/avatar-look/${arSessionId}`, {
          method: 'POST',
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Avatar look request failed (${response.status})`);

        const data = await response.json();
        const image = data.avatarImageUrl || data.avatarImage || data.imageUrl;
        if (!image || !data.styleProfileId) throw new Error('Avatar look response is missing image or style profile');

        const avatarImageUrl = resolveAvatarImageUrl(image);
        onFinish?.({
          ...data,
          avatarImageUrl,
        });
      } catch (generationError) {
        if (generationError.name !== 'AbortError') {
          console.error('아바타 룩 생성 오류:', generationError);
          setError('아바타 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          setIsGeneratingAvatar(false);
        }
      }
    }

    createAvatarLook();
    return () => controller.abort();
  }, [arSessionId, isGeneratingAvatar, onFinish]);

  function handleCategoryClick(categoryName) {
    setCategory(categoryName);
    setSelected(0);
    setOpen(false);
    setError('');
    fetchRecommendations(categoryName);
  }

  async function handleRefresh() {
    const categoryCode = categoryCodeMap[category];
    if (!Number.isFinite(arSessionId) || !categoryCode) return;

    try {
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Recommendations refresh failed (${response.status})`);

      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('Recommendations refresh returned an invalid products value');

      setRecommendedProducts([...data.products]);
      setSelected(0);
      setOpen(false);
    } catch (refreshError) {
      console.error('추천 상품 새로고침 오류:', refreshError);
      setError('추천 상품을 새로고침하지 못했습니다.');
    }
  }

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

  async function fitSelectedProduct() {
    if (!selectedProduct || !Number.isFinite(arSessionId)) return;

    const product = selectedProduct;
    const isDeselect = history.some((item) => item.productId === product.productId && item.active !== false);
    // 카테고리별로 한 상품만 착용할 수 있으므로, 같은 카테고리의 다른 상품을 선택하면
    // 기존 상품을 먼저 해제해 API 세션과 화면의 착용 상태를 함께 갱신한다.
    // 아바타는 한 번에 하나의 상품만 착용하므로, 다른 상품을 선택하면
    // 현재 착용 중인 상품을 먼저 해제한다.
    const previousFittingItem = !isDeselect
      ? history.find((item) => item.active !== false && item.productId !== product.productId)
      : null;
    const requestNo = interactionRequestNoRef.current + 1;
    interactionRequestNoRef.current = requestNo;
    setIsInteractionPending(true);
    setError('');

    try {
      if (previousFittingItem) {
        await postArInteraction({
          arSessionId,
          productId: previousFittingItem.productId,
          interactionType: AR_INTERACTION_TYPES.PRODUCT_DESELECT,
        });
      }

      const response = await postArInteraction({
        arSessionId,
        productId: product.productId,
        interactionType: isDeselect ? AR_INTERACTION_TYPES.PRODUCT_DESELECT : AR_INTERACTION_TYPES.PRODUCT_SELECT,
      });

      const nextAvatarImage = await applyAvatarImage(response, requestNo);
      if (requestNo !== interactionRequestNoRef.current) return;

      // 상품을 새로 피팅하면 기존 아바타 구성은 해제된다. 피팅 아이콘 상태도
      // 아바타 상태와 함께 초기화하지 않으면 이전 카테고리 상품이 계속
      // '피팅 취소' 상태로 남아 다시 피팅할 수 없게 된다.
      const deactivatedProductIds = isDeselect
        ? [product.productId]
        : history
            .filter((item) => item.active !== false && item.productId !== product.productId)
            .map((item) => item.productId);
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

      void evaluateArSessionMessage(arSessionId, language)
        .then((result) => {
          if (result?.triggered === true) {
            if (typeof result.message === 'string') {
              setComment(result.message);
            }
          }
        })
        .catch((evaluationError) => {
          console.error('Comment evaluation 오류:', evaluationError);
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
            wishlisted: false,
          },
          ...items
            .filter((item) => item.productId !== product.productId)
            .map((item) => (
              item.productId === previousFittingItem?.productId ? { ...item, active: false } : item
            )),
        ]);
      } else if (previousFittingItem) {
        // 새 상품의 아바타 이미지가 없더라도, 앞선 해제 요청은 성공했으므로
        // 기존 상품을 히스토리에 남긴 채 착용 상태만 해제한다.
        setHistory((items) => items.map((item) => (
          item.productId === previousFittingItem.productId ? { ...item, active: false } : item
        )));
      }

      setOpen(false);
    } catch (fitError) {
      if (requestNo === interactionRequestNoRef.current) {
        console.error('AR PRODUCT interaction 오류:', fitError);
        setError(FITTING_ERROR_MESSAGE);
      }
    } finally {
      if (requestNo === interactionRequestNoRef.current) setIsInteractionPending(false);
    }
  }

  async function handleHistoryProductClick(item) {
    if (!item) return;

    const activeHistoryItem = history.find((historyItem) => historyItem.active !== false);

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
    setIsInteractionPending(true);
    setError('');

    try {
      const response = await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: AR_INTERACTION_TYPES.PRODUCT_SELECT,
      });

      if (requestNo !== interactionRequestNoRef.current) return;

      const nextAvatarImage = response?.avatarImageUrl
        ? await applyAvatarImage(response, requestNo)
        : item.avatarImage;

      if (requestNo !== interactionRequestNoRef.current) return;

      setAvatarImage(nextAvatarImage || item.avatarImage);
      if (!nextAvatarImage && !item.avatarImageUrl) setNoAvatarProduct(item);
      setHistory((items) => items.map((historyItem) => (
        historyItem.productId === item.productId
          ? { ...historyItem, active: true, avatarImage: nextAvatarImage || historyItem.avatarImage }
          : { ...historyItem, active: false }
      )));
      setOpen(false);
    } catch (interactionError) {
      if (requestNo === interactionRequestNoRef.current) {
        console.error('AR history PRODUCT_SELECT interaction error:', interactionError);
        setError(FITTING_ERROR_MESSAGE);
      }
    } finally {
      if (requestNo === interactionRequestNoRef.current) setIsInteractionPending(false);
    }
  }

  async function toggleWishlist(item) {
    const nextWishlisted = !item.wishlisted;

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
      });
    } catch (interactionError) {
      console.error('WISHLIST interaction 오류:', interactionError);

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

    if (fittingRecordedProductIds.has(item.productId)) return;

    setFittingPendingIds((ids) => new Set(ids).add(item.productId));

    try {
      await postArInteraction({
        arSessionId,
        productId: item.productId,
        interactionType: AR_INTERACTION_TYPES.FITTING,
      });
      setFittingRecordedProductIds((ids) => new Set(ids).add(item.productId));
    } catch (interactionError) {
      console.error('FITTING interaction 오류:', interactionError);

      setFittingProductIds((ids) => {
        const next = new Set(ids);
        if (wasFitting) next.add(item.productId);
        else next.delete(item.productId);
        return next;
      });
    } finally {
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

      <div className="fitting-page__history" ref={historyRef} aria-label="피팅 히스토리">
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

            {item && <img className="fitting-page__history-product" src={item.imageUrl} alt={`${getProductName(item, language)} 피팅 기록`} />}
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

      <img className="fitting-page__avatar" src={avatarImage} alt="fitting avatar" />

      <button
        className={`fitting-page__finish ${language === 'en' ? 'fitting-page__finish--english' : ''}`}
        type="button"
        onClick={() => setIsGeneratingAvatar(true)}
      >
        {t.fittingFinish}
      </button>

      <section className="fitting-page__catalog" aria-label="추천 상품">
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
          <img src="/assets/figma-fitting-refresh.svg" alt="새로고침" />
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
            <button className="fitting-product-frame__close" type="button" onClick={() => setOpen(false)} aria-label="닫기">×</button>
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
                ? (language === 'en' ? 'Remove' : '해제하기')
                : (language === 'en' ? 'Try on' : '피팅하기')}
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
            <p id="fitting-no-avatar-title">현재 가상 피팅 준비 중인 제품입니다.<br />데모 지원 제품을 선택해 주세요.</p>
            <button type="button" onClick={() => setNoAvatarProduct(null)}>확인</button>
          </div>
        </div>
      )}
    </section>
  );
}
