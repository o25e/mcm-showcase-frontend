import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProducts } from './api/products';
import CartPage from './components/CartPage';
import LoginPanel from './components/LoginPanel';
import SearchOverlay from './components/SearchOverlay';
import SearchResultsPage from './components/SearchResultsPage';
import WishlistPage from './components/WishlistPage';
import StoreHeader from './components/StoreHeader';
import { ko } from './i18n/ko';
import { useWishlist, wishlistIdForProduct } from './utils/wishlist';

function formatPrice(price) {
  if (typeof price !== 'number') return price || '';
  return `₩${price.toLocaleString('ko-KR')}`;
}

function collectSearchText(value, seen = new WeakSet()) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if (seen.has(value)) return '';

  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => collectSearchText(item, seen)).join(' ');
  return Object.values(value).map((item) => collectSearchText(item, seen)).join(' ');
}

export default function App({ member, onLoginSuccess, onLogout, page = 'home', collectionType, autoOpenLogin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(autoOpenLogin);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(page === 'home' || page === 'cart');
  const [productsError, setProductsError] = useState('');
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [bagProducts, setBagProducts] = useState([]);
  const [isBagLoading, setIsBagLoading] = useState(false);
  const [bagError, setBagError] = useState('');
  const [femaleProducts, setFemaleProducts] = useState([]);
  const [isFemaleLoading, setIsFemaleLoading] = useState(false);
  const [femaleError, setFemaleError] = useState('');
  const [maleProducts, setMaleProducts] = useState([]);
  const [isMaleLoading, setIsMaleLoading] = useState(false);
  const [maleError, setMaleError] = useState('');
  const [travelProducts, setTravelProducts] = useState([]);
  const [isTravelLoading, setIsTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState('');
  const [wishlist, toggleWishlist] = useWishlist(member?.memberId);
  const requestedSearchQuery = new URLSearchParams(location.search).get('q')?.trim() || '';
  const isBagPage = page === 'collection' && collectionType === 'bags';
  const isFemalePage = page === 'collection' && collectionType === 'women';
  const isMalePage = page === 'collection' && collectionType === 'men';
  const isTravelPage = page === 'collection' && collectionType === 'travel';

  useEffect(() => {
    if (page !== 'home' && page !== 'cart') return undefined;
    let isActive = true;

    getProducts()
      .then((productResponses) => {
        if (!isActive) return;
        setProducts(productResponses.map(mapProduct));
      })
      .catch((error) => {
        if (isActive && error?.name !== 'AbortError') {
          setProductsError('신상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (isActive) setIsProductsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [page]);

  useEffect(() => {
    if (page !== 'collection') return undefined;

    const config = {
      new: { query: {}, setProducts: setProducts, setLoading: setIsProductsLoading, setError: setProductsError },
      bags: { query: { category: 'BAG' }, setProducts: setBagProducts, setLoading: setIsBagLoading, setError: setBagError },
      women: { query: { gender: 'FEMALE' }, setProducts: setFemaleProducts, setLoading: setIsFemaleLoading, setError: setFemaleError },
      men: { query: { gender: 'MALE' }, setProducts: setMaleProducts, setLoading: setIsMaleLoading, setError: setMaleError },
      travel: { query: { zone: 'TRAVEL' }, setProducts: setTravelProducts, setLoading: setIsTravelLoading, setError: setTravelError },
    }[collectionType];
    if (!config) return undefined;

    const controller = new AbortController();
    let isActive = true;
    config.setLoading(true);
    config.setError('');
    getProducts(config.query, controller.signal)
      .then((response) => {
        if (isActive) config.setProducts(response.map(mapProduct));
      })
      .catch((error) => {
        if (isActive && error?.name !== 'AbortError') config.setError('상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (isActive) config.setLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page, collectionType]);

  useEffect(() => {
    if (page !== 'search' || !requestedSearchQuery) {
      setSearchProducts([]);
      setSearchError('');
      setIsSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    setIsSearchLoading(true);
    setSearchError('');
    getProducts({ keyword: requestedSearchQuery }, controller.signal)
      .then((productResponses) => {
        if (isActive) setSearchProducts(productResponses.map(mapProduct));
      })
      .catch((error) => {
        if (isActive && error?.name !== 'AbortError') {
          setSearchError('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (isActive) setIsSearchLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page, requestedSearchQuery]);

  function mapProduct(product) {
    return {
      id: product.productId ?? product.id,
      name: product.name,
      nameEn: product.nameEn,
      searchText: collectSearchText(product),
      price: formatPrice(product.price),
      image: product.imageUrl ?? product.image,
      detailUrl: product.detailUrl ?? product.productUrl,
    };
  }

  const isCartPage = page === 'cart';
  const isWishlistPage = page === 'wishlist';
  const isSearchPage = page === 'search';
  const searchQuery = requestedSearchQuery;

  function showStorefront(event, sectionId, isNewProducts = false) {
    event?.preventDefault();
    const query = isNewProducts ? '?zone=NEW' : '';
    navigate(sectionId ? `/${query}#${sectionId}` : `/${query}`);
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
        onSearchOpen={() => setIsSearchOpen(true)}
        onCollectionNavigate={(event, item) => showStorefront(event, 'collection', item === '신상품')}
      />

      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {isSearchPage ? (
        <SearchResultsPage
          query={searchQuery}
          products={searchProducts}
          wishlist={wishlist}
          isLoading={isSearchLoading}
          error={searchError}
          onToggleWishlist={handleProductWishlist}
        />
      ) : isCartPage ? (
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
        <section className={`figma-hero${isBagPage ? ' figma-hero--bag' : ''}${isFemalePage ? ' figma-hero--female' : ''}${isMalePage ? ' figma-hero--male' : ''}${isTravelPage ? ' figma-hero--travel' : ''}`} aria-label={isBagPage ? 'MCM 가방 컬렉션' : isFemalePage ? 'MCM 여성 컬렉션' : isMalePage ? 'MCM 남성 컬렉션' : isTravelPage ? 'MCM 트래블 컬렉션' : ko.home.heroAlt}>
          <img className="hero-image" src={isBagPage ? '/assets/bag-hero.png' : isFemalePage ? '/assets/female-hero.png' : isMalePage ? '/assets/male-hero.png' : isTravelPage ? '/assets/travel-hero.png' : '/assets/figma-hero.png'} alt={isBagPage ? 'MCM 가방 컬렉션' : isFemalePage ? 'MCM 여성 컬렉션' : isMalePage ? 'MCM 남성 컬렉션' : isTravelPage ? 'MCM 트래블 컬렉션' : ko.home.heroAlt} />
          {!isBagPage && !isFemalePage && !isMalePage && !isTravelPage && <div className="hero-detail"><img src="/assets/figma-hero-detail.png" alt={ko.home.detailAlt} /></div>}
          {!isBagPage && !isFemalePage && !isMalePage && !isTravelPage && (
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
        ) : isTravelPage ? (
          <section className="figma-collection" id="travel-collection" aria-labelledby="travel-collection-title">
            <h1 id="travel-collection-title">트래블</h1>
            {isTravelLoading && <p className="product-list-status">트래블 상품을 불러오는 중입니다.</p>}
            {!isTravelLoading && travelError && <p className="product-list-status product-list-status--error">{travelError}</p>}
            {!isTravelLoading && !travelError && travelProducts.length === 0 && <p className="product-list-status">등록된 트래블 상품이 없습니다.</p>}
            <div className="figma-product-grid">
              {travelProducts.map((product) => <ProductCard key={product.id} product={product} wishlist={wishlist} onWishlist={handleProductWishlist} />)}
            </div>
          </section>
        ) : <section className="figma-collection" id="collection" aria-labelledby="collection-title">
          <h1 id="collection-title">{ko.home.collectionTitle}</h1>
          {isProductsLoading && <p className="product-list-status">신상품을 불러오는 중입니다.</p>}
          {!isProductsLoading && productsError && <p className="product-list-status product-list-status--error">{productsError}</p>}
          {!isProductsLoading && !productsError && products.length === 0 && <p className="product-list-status">등록된 신상품이 없습니다.</p>}

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
