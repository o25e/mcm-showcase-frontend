import { useState } from 'react';
import LoginPanel from './components/LoginPanel';
import WishlistPage from './components/WishlistPage';
import { ko } from './i18n/ko';
import { useWishlist, wishlistIdForProduct } from './utils/wishlist';

const { navigation, products } = ko;

const utilities = [
  [ko.utilities.search, '/assets/figma-search.svg'],
  [ko.utilities.myPage, '/assets/figma-user.svg'],
  [ko.utilities.wishlist, '/assets/figma-heart.svg'],
  [ko.utilities.shoppingBag, '/assets/figma-bag.svg'],
];

export default function App({ member, onLoginSuccess, onLogout, autoOpenLogin = false, autoOpenWishlist = false }) {
  const [isLoginOpen, setIsLoginOpen] = useState(autoOpenLogin);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWishlistPage, setIsWishlistPage] = useState(autoOpenWishlist);
  const [wishlist, toggleWishlist] = useWishlist();

  return (
    <div className="figma-home" id="top">
      <div className="figma-announcement">
        <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
        <span>{ko.announcement.icon}</span>
        <a href="#collection">{ko.announcement.home}</a>

        <div className="announcement-links">
          <a href="#collection">{ko.announcement.shipping}</a>
          <a href="#collection">{ko.announcement.contact}</a>
          <a href="#collection">{ko.announcement.locale}</a>
          <a href="#collection">{ko.announcement.store}</a>
        </div>
      </div>

      <header className={`figma-nav${isMobileMenuOpen ? ' is-mobile-menu-open' : ''}`}>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={ko.common.menuOpen}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <img src="/assets/icon-menu.svg" alt="" />
        </button>
        <button className="mobile-search-button" type="button" aria-label={ko.common.search}>
          <img src="/assets/figma-search.svg" alt="" />
        </button>
        <nav aria-label={ko.common.mainNav}>
          {navigation.map((item) => (
            <a href="#collection" key={item} onClick={() => {
              setIsWishlistPage(false);
              setIsMobileMenuOpen(false);
            }}>{item}</a>
          ))}
        </nav>

        <a className="figma-logo" href="#top" aria-label={ko.common.home} onClick={() => setIsWishlistPage(false)}>
          <img src="/assets/figma-logo.png" alt="MCM" />
        </a>

        <div className="figma-tools">
          {utilities.map(([label, src]) => (
            <button
              type="button"
              aria-label={label}
              key={label}
              onClick={label === ko.utilities.myPage
                ? () => setIsLoginOpen(true)
                : label === ko.utilities.wishlist ? () => setIsWishlistPage(true) : undefined}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        {isMobileMenuOpen && <button className="mobile-menu-backdrop" type="button" aria-label={ko.common.menuClose} onClick={() => setIsMobileMenuOpen(false)} />}
      </header>

      {isWishlistPage ? (
        <WishlistPage
          member={member}
          onBack={() => setIsWishlistPage(false)}
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
                    onClick={() => toggleWishlist({
                      productId: product.id,
                      wishlistId: wishlistIdForProduct(product.id),
                      source: 'collection',
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      detailUrl: product.detailUrl,
                    })}
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
            setIsWishlistPage(true);
            setIsLoginOpen(false);
          }}
        />
      )}
    </div>
  );
}
