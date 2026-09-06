import { ko } from '../i18n/ko';

export default function Header() {
  return (
    <header className="topbar">
      <button className="back-button" type="button" onClick={() => history.back()} aria-label={ko.common.previousPage}>
        <img src="/assets/product-detail-back.svg" alt="" />
        <span>{ko.common.back}</span>
      </button>

      <a className="brand" href="#top" aria-label={ko.common.home}>MCM</a>

      <button className="icon-button" type="button" aria-label={ko.auth.wishlist}>
        <img src="/assets/product-detail-heart.svg" alt="" />
      </button>
    </header>
  );
}
