import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduct } from './api/products';
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
        onCollectionNavigate={(event) => showStorefront(event, 'collection')}
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
        <section className="figma-hero" aria-label={ko.home.heroAlt}>
          <img className="hero-image" src="/assets/figma-hero.png" alt={ko.home.heroAlt} />
          <div className="hero-detail"><img src="/assets/figma-hero-detail.png" alt={ko.home.detailAlt} /></div>
          <a className="collection-link" href="#collection"><img src="/assets/icon-arrow.svg" alt="arrow" /> {ko.home.shopCollection}</a>
        </section>

        <section className="figma-collection" id="collection" aria-labelledby="collection-title">
          <h1 id="collection-title">{ko.home.collectionTitle}</h1>

          <div className="figma-product-grid">
            {products.map((product) => (
              <article className="figma-product" key={product.id}>
                <div className="figma-product-image">
                  <a href={product.detailUrl} target="_blank" rel="noreferrer" aria-label={`${product.name} ${ko.common.officialDetail}`}>
                    <img src={product.image} alt={product.name} />
                  </a>
                  <button
                    type="button"
                    aria-label={`${product.name} ${ko.common.addWishlist}`}
                    aria-pressed={wishlist.some((item) => item.productId === String(product.id))}
                    onClick={() => handleProductWishlist(product)}
                  >
                    <img src={wishlist.some((item) => item.productId === String(product.id)) ? '/assets/icon-heart-small-click.svg' : '/assets/figma-heart-small.svg'} alt="" />
                  </button>
                </div>

                <h2>{product.name}</h2>
                <p>{product.price}</p>
              </article>
            ))}
          </div>
        </section>
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
