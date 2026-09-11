export default function SearchResultsPage({
  query,
  products,
  wishlist,
  isLoading,
  error,
  onToggleWishlist,
}) {
  const terms = query
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .split(/\s+/)
    .filter(Boolean);

  const filteredProducts = terms.length === 0
    ? []
    : products.filter((product) => {
      const searchableText = `${product.name || ''} ${product.nameEn || ''} ${product.searchText || ''}`
        .normalize('NFKC')
        .toLocaleLowerCase('ko-KR');
      return terms.every((term) => searchableText.includes(term));
    });

  return (
    <main className="search-results-page" aria-labelledby="search-results-title">
      <header className="search-results-page__header">
        <h1 id="search-results-title">
          검색하신 &quot;{query}&quot;에 대한 결과입니다. ({filteredProducts.length} 항목)
        </h1>
      </header>

      {isLoading && <p className="search-results-page__status">상품을 검색하는 중입니다.</p>}
      {!isLoading && error && <p className="search-results-page__status search-results-page__status--error">{error}</p>}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <p className="search-results-page__status">검색 결과가 없습니다.</p>
      )}

      {!isLoading && !error && filteredProducts.length > 0 && (
        <section className="figma-product-grid" aria-label={`${query} 검색 결과 상품`}>
          {filteredProducts.map((product) => {
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
                <h2>{product.name}</h2>
                <p>{product.price}</p>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
