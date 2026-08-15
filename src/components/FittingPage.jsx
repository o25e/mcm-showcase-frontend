import { useEffect, useRef, useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

const products = [
  {
    productId: 1,
    name: 'New Liz 엠보스드 모노그램 레더 쇼퍼',
    price: 1490000,
    image: 'https://api.mcm-showcase.com/images/MWPGALR01BK001.jpg',
  },
  {
    productId: 2,
    name: 'Tracy 비세토스 호보',
    price: 1690000,
    image: 'https://api.mcm-showcase.com/images/MWHGAXT03CO001.jpg',
  },
  {
    productId: 3,
    name: 'Aren 다이아몬드 퀼팅 레더 백팩',
    price: 2690000,
    image: 'https://api.mcm-showcase.com/images/MMKGATA01BK001.jpg',
  },
  {
    productId: 4,
    name: 'Ottomar 비세토스 위켄더',
    price: 2050000,
    image: 'https://api.mcm-showcase.com/images/MMVAAVY02BK001.jpg',
  },
  {
    productId: 5,
    name: 'New Liz 비세토스 쇼퍼',
    price: 1090000,
    image: 'https://api.mcm-showcase.com/images/MWPGSLR024B001.jpg',
  },
  {
    productId: 6,
    name: 'Fursten 모노그램 나일론 벨트백',
    price: 650000,
    image: 'https://api.mcm-showcase.com/images/MMZGSFI01BK001.jpg',
  },
];

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
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const selectedAvatar = avatarByGender[gender] ?? avatarByGender.FEMALE;
  const [avatarImage, setAvatarImage] = useState(selectedAvatar);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const historyRef = useRef(null);

  const selectedProduct = products[selected];

  useEffect(() => {
    setAvatarImage(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [history.length]);

  useEffect(() => {
    if (!isGeneratingAvatar) return undefined;

    const timer = window.setTimeout(() => {
      onFinish?.(completeAvatarByGender[gender] ?? completeAvatarByGender.FEMALE);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [avatarImage, isGeneratingAvatar, onFinish]);

  if (isGeneratingAvatar) {
    return (
      <main className="avatar-generating-page" aria-labelledby="avatar-generating-title">
        <img className="avatar-generating-page__background" src="/assets/ar-background.png" alt="" aria-hidden="true" />
        <div className="avatar-generating-page__shade" />

        <nav className="ar-page__progress" aria-label="AR fitting progress">
          {steps.map((step, index) => (
            <span className={index < 5 ? 'active' : ''} key={step}>{step}</span>
          ))}
        </nav>
        <div className="ar-page__progress-track ar-page__progress-track--avatar" aria-hidden="true"><span /></div>

        <span className="avatar-generating-page__divider" aria-hidden="true" />
        <p id="avatar-generating-title" className="avatar-generating-page__message">
          오늘의 쇼핑 여정을 담은 Avatar를 만들고 있어요.
        </p>
        <img className="avatar-generating-page__wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" />
      </main>
    );
  }

  const visibleHistory = [
    ...history,
    ...Array.from(
      { length: Math.max(0, 3 - history.length) },
      () => null
    ),
  ];

  function selectProduct(product, index) {
    setSelected(index);
    setOpen(true);
    setError('');
  }

  async function fitSelectedProduct() {
    setAvatarImage(selectedAvatar);

    setHistory((items) => [
      {
        id: `${selectedProduct.productId}-${Date.now()}`,
        productId: selectedProduct.productId,
        productName: selectedProduct.name,
        imageUrl: selectedProduct.image,
        avatarImage: selectedAvatar,
      },
      ...items.filter(
        (item) => item.productId !== selectedProduct.productId
      ),
    ]);

    setOpen(false);
    setError('');

    try {
      const response = await fetch('/api/ar-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arSessionId,
          productId: selectedProduct.productId,
          interactionType: 'PRODUCT_SELECT',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error('PRODUCT_SELECT 실패:', {
          status: response.status,
          body: errorText,
          arSessionId,
          productId: selectedProduct.productId,
        });
      }
    } catch (fitError) {
      console.error('PRODUCT_SELECT error:', fitError);
    }
  }

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
        onClick={() => setIsGeneratingAvatar(true)}
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
                category === item ? 'active' : ''
              }
              type="button"
              role="tab"
              aria-selected={category === item}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <span className="fitting-page__catalog-rule" />

        <div className="fitting-page__product-grid">
          {products.map((product, index) => (
            <button
              className={`fitting-page__product ${
                selected === index
                  ? 'selected'
                  : ''
              }`}
              type="button"
              onClick={() =>
                selectProduct(product, index)
              }
              key={product.productId}
              aria-label={product.name}
            >
              <img
                src={product.image}
                alt={product.name}
              />
            </button>
          ))}
        </div>

        <span className="fitting-page__product-bottom-rule" />

        <button
          className="fitting-page__refresh"
          type="button"
          onClick={() =>
            setSelected(
              (selected + 1) % products.length
            )
          }
        >
          <img
            src="/assets/figma-fitting-refresh.svg"
            alt="새로고침"
          />
        </button>
      </section>

      {open && (
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
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>

            <img
              className="fitting-product-frame__image"
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <h2>{selectedProduct.name}</h2>

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
