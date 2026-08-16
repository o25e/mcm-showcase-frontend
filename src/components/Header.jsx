export default function Header() {
  return (
    <header className="topbar">
      <button className="back-button" type="button" onClick={() => history.back()} aria-label="이전 페이지로 돌아가기">
        <img src="/assets/product-detail-back.svg" alt="" />
        <span>돌아가기</span>
      </button>

      <a className="brand" href="#top" aria-label="MCM 홈">MCM</a>

      <button className="icon-button" type="button" aria-label="찜 목록">
        <img src="/assets/product-detail-heart.svg" alt="" />
      </button>
    </header>
  );
}