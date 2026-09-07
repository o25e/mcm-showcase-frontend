import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ko } from '../i18n/ko';

const utilityItems = [
  { key: 'search', label: ko.utilities.search, icon: '/assets/figma-search.svg' },
  { key: 'myPage', label: ko.utilities.myPage, icon: '/assets/figma-user.svg' },
  { key: 'wishlist', label: ko.utilities.wishlist, icon: '/assets/figma-heart.svg' },
  { key: 'cart', label: ko.utilities.shoppingBag, icon: '/assets/figma-bag.svg' },
];

function scrollToCollection() {
  window.requestAnimationFrame(() => {
    document.getElementById('collection')?.scrollIntoView();
  });
}

export default function StoreHeader({
  activePage = 'home',
  announcementLabel,
  onLoginOpen,
  onWishlistOpen,
  onCartOpen,
  onSearchOpen,
  onCollectionNavigate,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const announcementTarget = activePage === 'closet' ? 'closet-records' : 'collection';
  const announcementText = announcementLabel || (
    activePage === 'closet' ? ko.announcement.closet : ko.announcement.home
  );

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleCollectionNavigate(event) {
    event.preventDefault();
    closeMobileMenu();

    if (onCollectionNavigate) {
      onCollectionNavigate(event);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/#collection');
      return;
    }

    navigate('/#collection');
    scrollToCollection();
  }

  function handleLogoClick(event) {
    event.preventDefault();
    closeMobileMenu();

    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    navigate('/');
    window.scrollTo({ top: 0 });
  }

  function handleUtilityClick(key) {
    closeMobileMenu();

    const handlers = {
      search: onSearchOpen,
      myPage: onLoginOpen,
      wishlist: onWishlistOpen,
      cart: onCartOpen,
    };

    handlers[key]?.();
  }

  return (
    <>
      <div className={`figma-announcement${activePage === 'closet' ? ' closet-announcement' : ''}`}>
        <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
        <span>{ko.announcement.icon}</span>
        <a href={`#${announcementTarget}`}>{announcementText}</a>

        <div className="announcement-links">
          <a href={`#${announcementTarget}`}>{ko.announcement.shipping}</a>
          <a href={`#${announcementTarget}`}>{ko.announcement.contact}</a>
          <a href={`#${announcementTarget}`}>{ko.announcement.locale}</a>
          <a href={`#${announcementTarget}`}>{ko.announcement.store}</a>
        </div>
      </div>

      <header className={`figma-nav${activePage === 'closet' ? ' closet-nav' : ''}${isMobileMenuOpen ? ' is-mobile-menu-open' : ''}`}>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={ko.common.menuOpen}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <img src="/assets/icon-menu.svg" alt="" />
        </button>

        <button className="mobile-search-button" type="button" aria-label={ko.common.search} onClick={() => handleUtilityClick('search')}>
          <img src="/assets/figma-search.svg" alt="" />
        </button>

        <nav aria-label={ko.common.mainNav}>
          {ko.navigation.map((item) => {
            const isCloset = item === 'CLOSET';

            return isCloset ? (
              <a
                href="/my-closet"
                className={activePage === 'closet' ? 'active' : ''}
                key={item}
                onClick={(event) => {
                  event.preventDefault();
                  navigate('/my-closet');
                  closeMobileMenu();
                }}
              >
                {item}
              </a>
            ) : (
              <a href="/#collection" key={item} onClick={handleCollectionNavigate}>
                {item}
              </a>
            );
          })}
        </nav>

        <a className="figma-logo" href="/" aria-label={ko.common.home} onClick={handleLogoClick}>
          <img src="/assets/figma-logo.png" alt="MCM" />
        </a>

        <div className="figma-tools">
          {utilityItems.map(({ key, label, icon }) => (
            <button type="button" aria-label={label} key={key} onClick={() => handleUtilityClick(key)}>
              <img src={icon} alt="" />
            </button>
          ))}
        </div>

        {isMobileMenuOpen && (
          <button
            className="mobile-menu-backdrop"
            type="button"
            aria-label={ko.common.menuClose}
            onClick={closeMobileMenu}
          />
        )}
      </header>
    </>
  );
}
