import { useCallback, useEffect, useRef, useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

const categoryCodeMap = {
  Bags: 'bag',
  Tops: 'top',
  Bottoms: 'bottom',
  Shoes: 'shoes',
  Accessories: 'accessories',
};

const avatarByGender = {
  FEMALE: '/assets/figma-fitting/model_f.png',
  MALE: '/assets/figma-fitting/model_m.png',
};

const completeAvatarByGender = {
  FEMALE: '/assets/avatar-complete/avatar_f.png',
  MALE: '/assets/avatar-complete/avatar_m.png',
};

export default function FittingPage({ onFinish, arSessionId, gender }) {
  const [category, setCategory] = useState('Bags');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const selectedAvatar = avatarByGender[gender] ?? avatarByGender.FEMALE;
  const [avatarImage, setAvatarImage] = useState(selectedAvatar);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const historyRef = useRef(null);

  const selectedProduct = recommendedProducts[selected] ?? null;

  const fetchRecommendations = useCallback(
    async (categoryName) => {
      const categoryCode = categoryCodeMap[categoryName];

      if (!arSessionId) {
        console.error('추천 상품 조회 실패: arSessionId가 없습니다.');
        return;
      }

      if (!categoryCode) {
        console.error('추천 상품 조회 실패: categoryCode가 없습니다.');
        return;
      }

      try {
        setError('');

        const response = await fetch(
          `https://api.mcm-showcase.com/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error('추천 상품 조회 실패:', {
            status: response.status,
            body: errorText,
            arSessionId,
            categoryCode,
          });

          setError('추천 상품을 불러오지 못했습니다.');
          setRecommendedProducts([]);
          return;
        }

        const data = await response.json();

        console.log('추천 상품 조회 성공:', {
          arSessionId: data.arSessionId,
          categoryCode,
          products: data.products,
        });

        setRecommendedProducts(
          Array.isArray(data.products)
            ? data.products
            : []
        );

        setSelected(0);
      } catch (recommendationError) {
        console.error(
          '추천 상품 조회 error:',
          recommendationError
        );

        setError('추천 상품을 불러오지 못했습니다.');
        setRecommendedProducts([]);
      }
    },
    [arSessionId]
  );

  useEffect(() => {
    setAvatarImage(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (!arSessionId) return;

    fetchRecommendations('Bags');
  }, [arSessionId, fetchRecommendations]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [history.length]);

  useEffect(() => {
    if (!isGeneratingAvatar) return undefined;

    const timer = window.setTimeout(() => {
      onFinish?.(
        completeAvatarByGender[gender] ??
          completeAvatarByGender.FEMALE
      );
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [gender, isGeneratingAvatar, onFinish]);

  function handleCategoryClick(categoryName) {
    setCategory(categoryName);
    setSelected(0);
    setOpen(false);
    setError('');

    fetchRecommendations(categoryName);
  }

  async function handleRefresh() {
    const categoryCode = categoryCodeMap[category];

    if (!arSessionId) {
      console.error(
        '추천 상품 새로고침 실패: arSessionId가 없습니다.'
      );
      return;
    }

    if (!categoryCode) {
      console.error(
        '추천 상품 새로고침 실패: categoryCode가 없습니다.'
      );
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `https://api.mcm-showcase.com/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}/refresh`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error('추천 상품 새로고침 실패:', {
          status: response.status,
          body: errorText,
          arSessionId,
          categoryCode,
        });

        setError('추천 상품을 새로고침하지 못했습니다.');
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data.products)) {
        console.error(
          '추천 상품 새로고침 실패: products가 배열이 아닙니다.',
          data
        );

        setError('추천 상품을 새로고침하지 못했습니다.');
        return;
      }

      console.log(
        '새로고침 전 상품:',
        recommendedProducts.map((product) => ({
          productId: product.productId,
          name: product.name,
        }))
      );

      console.log(
        '새로고침 후 상품:',
        data.products.map((product) => ({
          productId: product.productId,
          name: product.name,
        }))
      );

      if (data.products.length === 0) {
        console.warn('새로고침 API가 상품을 0개 반환했습니다.');
        return;
      }

      setRecommendedProducts([...data.products]);

      setSelected(0);
      setOpen(false);

      console.log('추천 상품 새로고침 완료');
    } catch (refreshError) {
      console.error(
        '추천 상품 새로고침 error:',
        refreshError
      );

      setError('추천 상품을 새로고침하지 못했습니다.');
    }
  }

  function selectProduct(product, index) {
    setSelected(index);
    setOpen(true);
    setError('');
  }

  async function fitSelectedProduct() {
    if (!selectedProduct) return;

    if (!arSessionId) {
      console.error(
        'PRODUCT_SELECT 실패: arSessionId가 없습니다.'
      );
      setError('피팅 정보를 저장하지 못했습니다.');
      return;
    }

    setError('');

    try {
      const response = await fetch(
        'https://api.mcm-showcase.com/api/ar-interactions',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            arSessionId,
            productId: selectedProduct.productId,
            interactionType: 'PRODUCT_SELECT',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error('PRODUCT_SELECT 실패:', {
          status: response.status,
          body: errorText,
          arSessionId,
          productId: selectedProduct.productId,
        });

        setError('피팅 정보를 저장하지 못했습니다.');
        return;
      }

      const data = await response.json();

      console.log('PRODUCT_SELECT 저장 성공:', {
        arInteractionId: data.arInteractionId,
        arSessionId: data.arSessionId,
        productId: data.productId,
        interactionType: data.interactionType,
        sequenceNo: data.sequenceNo,
        createdAt: data.createdAt,
      });

      setAvatarImage(selectedAvatar);

      setHistory((items) => [
        {
          id: `${selectedProduct.productId}-${Date.now()}`,
          productId: selectedProduct.productId,
          productName: selectedProduct.name,
          imageUrl: selectedProduct.imageUrl,
          avatarImage: selectedAvatar,
        },
        ...items.filter(
          (item) =>
            item.productId !== selectedProduct.productId
        ),
      ]);

      setOpen(false);
    } catch (fitError) {
      console.error('PRODUCT_SELECT error:', fitError);
      setError('피팅 정보를 저장하지 못했습니다.');
    }
  }

  if (isGeneratingAvatar) {
    return (
      <main
        className="avatar-generating-page"
        aria-labelledby="avatar-generating-title"
      >
        <img
          className="avatar-generating-page__background"
          src="/assets/ar-background.png"
          alt=""
          aria-hidden="true"
        />

        <div className="avatar-generating-page__shade" />

        <nav
          className="ar-page__progress"
          aria-label="AR fitting progress"
        >
          {steps.map((step, index) => (
            <span
              className={index < 5 ? 'active' : ''}
              key={step}
            >
              {step}
            </span>
          ))}
        </nav>

        <div
          className="ar-page__progress-track ar-page__progress-track--avatar"
          aria-hidden="true"
        >
          <span />
        </div>

        <span
          className="avatar-generating-page__divider"
          aria-hidden="true"
        />

        <p
          id="avatar-generating-title"
          className="avatar-generating-page__message"
        >
          오늘의 쇼핑 여정을 담은 Avatar를 만들고 있어요.
        </p>

        <img
          className="avatar-generating-page__wave"
          src="/assets/ar-scanning-wave.png"
          alt=""
          aria-hidden="true"
        />
      </main>
    );
  }

  const visibleHistory = [
    ...history,
    ...Array.from(
      {
        length: Math.max(
          0,
          3 - history.length
        ),
      },
      () => null
    ),
  ];

  return (
    <section
      className="fitting-page"
      aria-labelledby="fitting-page-title"
    >
      <img
        className="fitting-page__background"
        src="/assets/figma-fitting/raw_1.png"
        alt=""
        aria-hidden="true"
      />

      <div className="fitting-page__shade" />

      <nav
        className="fitting-page__steps"
        aria-label="AR fitting progress"
      >
        {steps.map((step, index) => (
          <span
            className={index < 4 ? 'active' : ''}
            key={step}
          >
            {step}
          </span>
        ))}
      </nav>

      <div className="fitting-page__track">
        <span />
      </div>

      <h1
        id="fitting-page-title"
        className="fitting-page__history-title"
      >
        History
      </h1>

      <div
        className="fitting-page__history"
        ref={historyRef}
        aria-label="피팅 히스토리"
      >
        {visibleHistory.map((item, index) => {
          return (
            <button
              className={`fitting-page__history-card ${
                item ? 'active' : ''
              }`}
              type="button"
              key={
                item
                  ? item.id
                  : `history-empty-${index}`
              }
              onClick={() =>
                item &&
                setAvatarImage(item.avatarImage)
              }
              disabled={!item}
            >
              <img
                className="fitting-page__history-heart"
                src="/assets/product-detail-heart-small.svg"
                alt=""
              />

              <img
                className="fitting-page__history-hanger"
                src="/assets/icon-cloth.png"
                alt=""
              />

              {item && (
                <img
                  className="fitting-page__history-product"
                  src={item.imageUrl}
                  alt={`${item.productName} 피팅 기록`}
                />
              )}
            </button>
          );
        })}
      </div>

      <span
        className="fitting-page__history-rule"
        aria-hidden="true"
      />

      <div className="fitting-page__comment">
        <h2>Comment</h2>
        <span />
      </div>

      <img
        className="fitting-page__avatar"
        src={avatarImage}
        alt="fitting avatar"
      />

      <button
        className="fitting-page__finish"
        type="button"
        onClick={() =>
          setIsGeneratingAvatar(true)
        }
      >
        피팅 종료하기
      </button>

      <section
        className="fitting-page__catalog"
        aria-label="추천 상품"
      >
        <div
          className="fitting-page__tabs"
          role="tablist"
        >
          {categories.map((item) => (
            <button
              className={
                category === item
                  ? 'active'
                  : ''
              }
              type="button"
              role="tab"
              aria-selected={category === item}
              onClick={() =>
                handleCategoryClick(item)
              }
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <span className="fitting-page__catalog-rule" />

        <div className="fitting-page__product-grid">
          {recommendedProducts.map(
            (product, index) => (
              <button
                className={`fitting-page__product ${
                  selected === index
                    ? 'selected'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  selectProduct(
                    product,
                    index
                  )
                }
                key={product.productId}
                aria-label={product.name}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                />
              </button>
            )
          )}
        </div>

        <span className="fitting-page__product-bottom-rule" />

        <button
          className="fitting-page__refresh"
          type="button"
          onClick={handleRefresh}
        >
          <img
            src="/assets/figma-fitting-refresh.svg"
            alt="새로고침"
          />
        </button>
      </section>

      {open && selectedProduct && (
        <div
          className="fitting-product-frame-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <article
            className="fitting-product-frame"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="fitting-product-frame__close"
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="닫기"
            >
              ×
            </button>

            <img
              className="fitting-product-frame__image"
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
            />

            <h2>
              {selectedProduct.name}
            </h2>

            <p className="fitting-product-frame__price">
              ₩{' '}
              {selectedProduct.price.toLocaleString()}
            </p>

            <p className="fitting-product-frame__color">
              Color
            </p>

            <div className="fitting-product-frame__swatches">
              <span />
              <span />
              <span />
              <span />
            </div>

            {error && (
              <p
                role="alert"
                className="fitting-error"
              >
                {error}
              </p>
            )}

            <button
              className="fitting-product-frame__fit"
              type="button"
              onClick={fitSelectedProduct}
            >
              피팅하기
            </button>
          </article>
        </div>
      )}
    </section>
  );
}