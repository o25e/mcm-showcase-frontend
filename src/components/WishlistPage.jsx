import { useWishlist } from '../utils/wishlist';

export default function WishlistPage({ onBack, member, memberId, onLoginOpen }) {
  const [wishlist, toggleWishlist] = useWishlist(memberId);

  return (
    <main className="wishlist-page" aria-labelledby="wishlist-title">
      <div className="wishlist-page__meta"><span>{wishlist.length}개 남음</span><span>마지막 재고</span></div>
      <h1 id="wishlist-title">고객님의 위시리스트</h1>
      {wishlist.length > 0 && (
        <p className="wishlist-page__login-prompt">
          위시리스트에 {wishlist.length}개의 아이템이 있습니다.
          {!member && <><span> 회원가입 또는 </span><button type="button" onClick={onLoginOpen}>로그인</button></>}
        </p>
      )}
      {wishlist.length === 0 ? (
        <div className="wishlist-page__empty-state">
          <p className="wishlist-page__empty">비어 있습니다.</p>
          <p className="wishlist-page__empty-center">
            여기에 표시할 <span className="wishlist-page__empty-heart" aria-hidden="true">♥</span> 내용.
          </p>
        </div>
      ) : (
        <section className="wishlist-page__grid" aria-label="찜한 상품 목록">
          {wishlist.map((item) => {
            const card = (
              <article className="wishlist-card">
                <div className="wishlist-card__image">
                  <img src={item.image || item.imageUrl} alt={item.name || item.nameEn || '찜한 상품'} />
                  <button type="button" className="wishlist-card__remove" aria-label="찜 목록에서 삭제" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist(item); }}>
                    <img src="/assets/icon-heart-small-click.svg" alt="" />
                  </button>
                </div>
                <h2>{item.name || item.nameEn || '상품'}</h2>
                {item.price && <p>{typeof item.price === 'number' ? `₩ ${item.price.toLocaleString()}` : item.price}</p>}
              </article>
            );
            return item.detailUrl ? <a className="wishlist-card-link" href={item.detailUrl} target="_blank" rel="noreferrer" key={item.wishlistId}>{card}</a> : <div className="wishlist-card-link" key={item.wishlistId}>{card}</div>;
          })}
        </section>
      )}
      <button className="wishlist-page__back" type="button" onClick={onBack}>컬렉션으로 돌아가기</button>
    </main>
  );
}
