import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduct, getProducts } from './api/products';
import CartPage from './components/CartPage';
import LoginPanel from './components/LoginPanel';
import WishlistPage from './components/WishlistPage';
import StoreHeader from './components/StoreHeader';
import { ko } from './i18n/ko';
import { useWishlist, wishlistIdForProduct } from './utils/wishlist';

const NEW_COLLECTION_PRODUCT_IDS = [1, 2, 3, 7];

function formatPrice(price) {
  if (typeof price !== 'number') return price || '';
  return `₩${price.toLocaleString('ko-KR')}`;
}

export default function App({ member, onLoginSuccess, onLogout, page = 'home', autoOpenLogin = false }) {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(autoOpenLogin);
  const [products, setProducts] = useState([]);
  const [bagProducts, setBagProducts] = useState([]);
  const [isBagPage, setIsBagPage] = useState(false);
  const [isBagLoading, setIsBagLoading] = useState(false);
  const [bagError, setBagError] = useState('');
  const [femaleProducts, setFemaleProducts] = useState([]);
  const [isFemalePage, setIsFemalePage] = useState(false);
  const [isFemaleLoading, setIsFemaleLoading] = useState(false);
  const [femaleError, setFemaleError] = useState('');
  const [maleProducts, setMaleProducts] = useState([]);
  const [isMalePage, setIsMalePage] = useState(false);
  const [isMaleLoading, setIsMaleLoading] = useState(false);
  const [maleError, setMaleError] = useState('');
  const [wishlist, toggleWishlist] = useWishlist(member?.memberId);

  useEffect(() => {
    let isActive = true;

    Promise.all(NEW_COLLECTION_PRODUCT_IDS.map((productId) => getProduct(productId)))
      .then((productResponses) => {
        if (!isActive) return;
        setProducts(productResponses.map((product) => ({
          id: product.productId,
          name: product.name,
          nameEn: product.nameEn,
          price: formatPrice(product.price),
          image: product.imageUrl,
          productId: product.productId,
        })));
      })
      .catch((error) => {
        if (isActive) console.error('신규 컬렉션 상품을 불러오지 못했습니다.', error);
      });

    return () => { isActive = false; };
  }, []);

  function mapProduct(product) {
    return {
      id: product.productId ?? product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: formatPrice(product.price),
      image: product.imageUrl ?? product.image,
      detailUrl: product.detailUrl ?? product.productUrl,
    };
  }

  function showBagCollection(event) {
    event?.preventDefault();
    setIsFemalePage(false);
    setIsMalePage(false);
    setIsBagPage(true);
    setBagError('');
    navigate('/#bag-collection');
    window.requestAnimationFrame(() => {
      document.getElementById('bag-collection')?.scrollIntoView();
    });

    if (bagProducts.length || isBagLoading) return;
    const controller = new AbortController();
    setIsBagLoading(true);
    getProducts({ category: 'BAG' }, controller.signal)
      .then((products) => setBagProducts(products.map(mapProduct)))
      .catch(() => setBagError('가방 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'))
      .finally(() => setIsBagLoading(false));
  }

  function showFemaleCollection(event) {
    event?.preventDefault();
    setIsBagPage(false);
    setIsMalePage(false);
    setIsFemalePage(true);
    setFemaleError('');
    navigate('/#female-collection');
    window.requestAnimationFrame(() => {
      document.getElementById('female-collection')?.scrollIntoView();
    });

    if (femaleProducts.length || isFemaleLoading) return;
    const controller = new AbortController();
    setIsFemaleLoading(true);
    getProducts({ gender: 'FEMALE' }, controller.signal)
      .then((products) => setFemaleProducts(products.map(mapProduct)))
      .catch(() => setFemaleError('여성 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'))
      .finally(() => setIsFemaleLoading(false));
  }

  function showMaleCollection(event) {
    event?.preventDefault();
    setIsBagPage(false);
    setIsFemalePage(false);
    setIsMalePage(true);
    setMaleError('');
    navigate('/#male-collection');
    window.requestAnimationFrame(() => {
      document.getElementById('male-collection')?.scrollIntoView();
    });

    if (maleProducts.length || isMaleLoading) return;
    const controller = new AbortController();
    setIsMaleLoading(true);
    getProducts({ gender: 'MALE' }, controller.signal)
      .then((products) => setMaleProducts(products.map(mapProduct)))
      .catch(() => setMaleError('남성 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'))
      .finally(() => setIsMaleLoading(false));
  }

  function showHomeCollection(event) {
    setIsBagPage(false);
    setIsFemalePage(false);
    setIsMalePage(false);
    showStorefront(event, 'collection');
  }

  const isCartPage = page === 'cart';
  const isWishlistPage = page === 'wishlist';

  function showStorefront(event, sectionId) {
    event?.preventDefault();
    navigate(sectionId ? `/#${sectionId}` : '/');
    window.requestAnimationFrame(() => {
      if (sectionId) document.getElementById(sectionId)?.scrollIntoView();
      else window.scrollTo({ top: 0 });
    });
  }

  function showWishlist() {
    navigate('/wishlist');
  }

  function showCart() {
    navigate('/cart');
    window.scrollTo({ top: 0 });
  }

  function handleProductWishlist(product) {
    toggleWishlist({
      productId: product.id,
      wishlistId: wishlistIdForProduct(product.id),
      source: 'collection',
      name: product.name,
      price: product.price,
      image: product.image,
      detailUrl: product.detailUrl,
    });
  }

  return (
    <div className="figma-home" id="top">
      <StoreHeader
        activePage="home"
        onLoginOpen={() => setIsLoginOpen(true)}
        onWishlistOpen={showWishlist}
        onCartOpen={showCart}
        onCollectionNavigate={showHomeCollection}
        onBagNavigate={showBagCollection}
        onFemaleNavigate={showFemaleCollection}
        onMaleNavigate={showMaleCollection}
      />

      {isCartPage ? (
        <CartPage
          member={member}
          products={products}
          wishlist={wishlist}
          onLoginOpen={() => setIsLoginOpen(true)}
          onContinueShopping={(event) => showStorefront(event, 'collection')}
          onToggleWishlist={handleProductWishlist}
        />
      ) : isWishlistPage ? (
        <WishlistPage
          memberId={member?.memberId}
          member={member}
          onBack={() => navigate('/')}
          onLoginOpen={() => setIsLoginOpen(true)}
        />
      ) : <main>
        <section className={`figma-hero${isBagPage ? ' figma-hero--bag' : ''}${isFemalePage ? ' figma-hero--female' : ''}${isMalePage ? ' figma-hero--male' : ''}`} aria-label={isBagPage ? 'MCM 가방 컬렉션' : isFemalePage ? 'MCM 여성 컬렉션' : isMalePage ? 'MCM 남성 컬렉션' : ko.home.heroAlt}>
          <img className="hero-image" src={isBagPage ? '/assets/bag-hero.png' : isFemalePage ? '/assets/female-hero.png' : isMalePage ? '/assets/male-hero.png' : '/assets/figma-hero.png'} alt={isBagPage ? 'MCM 가방 컬렉션' : isFemalePage ? 'MCM 여성 컬렉션' : isMalePage ? 'MCM 남성 컬렉션' : ko.home.heroAlt} />
          {!isBagPage && !isFemalePage && !isMalePage && <div className="hero-detail"><img src="/assets/figma-hero-detail.png" alt={ko.home.detailAlt} /></div>}
          {!isBagPage && !isFemalePage && !isMalePage && (
            <a className="collection-link" href="#collection">
              <img src="/assets/icon-arrow.svg" alt="arrow" /> {ko.home.shopCollection}
            </a>
          )}
        </section>

        {isBagPage ? (
          <section className="figma-collection" id="bag-collection" aria-labelledby="bag-collection-title">
            <h1 id="bag-collection-title">가방</h1>
            {isBagLoading && <p className="product-list-status">가방 상품을 불러오는 중입니다.</p>}
            {!isBagLoading && bagError && <p className="product-list-status product-list-status--error">{bagError}</p>}
            {!isBagLoading && !bagError && bagProducts.length === 0 && <p className="product-list-status">등록된 가방 상품이 없습니다.</p>}
            <div className="figma-product-grid">
              {bagProducts.map((product) => <ProductCard key={product.id} product={product} wishlist={wishlist} onWishlist={handleProductWishlist} />)}
            </div>
          </section>
        ) : isFemalePage ? (
          <section className="figma-collection" id="female-collection" aria-labelledby="female-collection-title">
            <h1 id="female-collection-title">여성</h1>
            {isFemaleLoading && <p className="product-list-status">여성 상품을 불러오는 중입니다.</p>}
            {!isFemaleLoading && femaleError && <p className="product-list-status product-list-status--error">{femaleError}</p>}
            {!isFemaleLoading && !femaleError && femaleProducts.length === 0 && <p className="product-list-status">등록된 여성 상품이 없습니다.</p>}
            <div className="figma-product-grid">
              {femaleProducts.map((product) => <ProductCard key={product.id} product={product} wishlist={wishlist} onWishlist={handleProductWishlist} />)}
            </div>
          </section>
        ) : isMalePage ? (
          <section className="figma-collection" id="male-collection" aria-labelledby="male-collection-title">
            <h1 id="male-collection-title">남성</h1>
            {isMaleLoading && <p className="product-list-status">남성 상품을 불러오는 중입니다.</p>}
            {!isMaleLoading && maleError && <p className="product-list-status product-list-status--error">{maleError}</p>}
            {!isMaleLoading && !maleError && maleProducts.length === 0 && <p className="product-list-status">등록된 남성 상품이 없습니다.</p>}
            <div className="figma-product-grid">
              {maleProducts.map((product) => <ProductCard key={product.id} product={product} wishlist={wishlist} onWishlist={handleProductWishlist} />)}
            </div>
          </section>
        ) : <section className="figma-collection" id="collection" aria-labelledby="collection-title">
          <h1 id="collection-title">{ko.home.collectionTitle}</h1>

          <div className="figma-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} wishlist={wishlist} onWishlist={handleProductWishlist} />
            ))}
          </div>
        </section>}
      </main>}

      {isLoginOpen && (
        <LoginPanel
          member={member}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={onLoginSuccess}
          onLogout={onLogout}
          wishlist={wishlist}
          onWishlistOpen={() => {
            showWishlist();
            setIsLoginOpen(false);
          }}
          onCartOpen={() => {
            showCart();
            setIsLoginOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProductCard({ product, wishlist, onWishlist }) {
  const isWished = wishlist.some((item) => item.productId === String(product.id));
  return (
    <article className="figma-product">
      <div className="figma-product-image">
        <a href={product.detailUrl} target="_blank" rel="noreferrer" aria-label={`${product.name} ${ko.common.officialDetail}`}>
          <img src={product.image} alt={product.name} />
        </a>
        <button type="button" aria-label={`${product.name} ${ko.common.addWishlist}`} aria-pressed={isWished} onClick={() => onWishlist(product)}>
          <img src={isWished ? '/assets/icon-heart-small-click.svg' : '/assets/figma-heart-small.svg'} alt="" />
        </button>
      </div>
      <h2>{product.name}</h2>
      <p>{product.price}</p>
    </article>
  );
}
