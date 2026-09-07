export default function CartPage({
  member,
  products,
  wishlist,
  onLoginOpen,
  onContinueShopping,
  onToggleWishlist,
}) {
  return (
    <main className="cart-page" aria-labelledby="cart-title">
      <section className="cart-page__empty" aria-label="빈 쇼핑백">
        <h1 id="cart-title">나의 쇼핑백(0 개 품목)</h1>
        <p className="cart-page__empty-message">쇼핑백이 비어 있습니다.</p>
        {!member && (
          <p className="cart-page__login-prompt">
            <button type="button" onClick={onLoginOpen}>로그인</button> 후 쇼핑백 확인하러 가기
          </p>
        )}
      </section>

      <section className="cart-page__continue" aria-labelledby="continue-shopping-title">
        <h2 id="continue-shopping-title">계속 쇼핑하기</h2>
        <a href="/#collection" onClick={onContinueShopping}>Autumn Winter 2026</a>
      </section>

      <section className="cart-page__recommendations" aria-labelledby="cart-recommendations-title">
        <h2 id="cart-recommendations-title">추천상품</h2>

        <div className="figma-product-grid">
          {products.map((product) => {
            const isWishlisted = wishlist.some((item) => item.productId === String(product.id));

            return (
              <article className="figma-product" key={product.id}>
                <div className="figma-product-image">
                  <a href={product.detailUrl} target="_blank" rel="noreferrer" aria-label={`${product.name} 공식 상세 보기`}>
                    <img src={product.image} alt={product.name} />
                  </a>
                  <button
                    type="button"
                    aria-label={`${product.name} 찜하기`}
                    aria-pressed={isWishlisted}
                    onClick={() => onToggleWishlist(product)}
                  >
                    <img src={isWishlisted ? '/assets/icon-heart-small-click.svg' : '/assets/figma-heart-small.svg'} alt="" />
                  </button>
                </div>

                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
