import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const suggestedSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/%EC%8B%A0%EC%83%81%ED%92%88/autumn-winter?search_type=suggested';
const pinaSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/%EC%8B%A0%EC%83%81%ED%92%88/pina?search_type=suggested';
const cinnamonSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/%EC%8B%A0%EC%83%81%ED%92%88/cinnamon-visetos?search_type=suggested';
const giftSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/%EC%84%A0%EB%AC%BC-%EC%A0%9C%EC%95%88/%EC%95%84%EC%9D%B4%EC%BD%94%EB%8B%89%ED%95%9C-%EC%84%A0%EB%AC%BC?search_type=suggested';
const travelSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/%ED%8A%B8%EB%9E%98%EB%B8%94/%EB%AA%A8%EB%91%90%EB%B3%B4%EA%B8%B0?search_type=suggested';
const perfumeSearchUrl = 'https://kr.mcmworldwide.com/ko_KR/search?q=perfume&search_type=suggested';

const suggestions = [
  { label: '2026 가을/겨울 컬렉션', url: suggestedSearchUrl },
  { label: 'PINA 백 컬렉션', url: pinaSearchUrl },
  { label: 'CINNAMON 비세토스', url: cinnamonSearchUrl },
  { label: '선물 아이디어', url: giftSearchUrl },
  { label: '여행 컬렉션', url: travelSearchUrl },
  { label: '향수류', url: perfumeSearchUrl },
];

export default function SearchOverlay({ onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const closeOnScroll = () => onClose();

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, { passive: true });
    window.addEventListener('wheel', closeOnScroll, { passive: true });
    window.addEventListener('touchmove', closeOnScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnScroll);
      window.removeEventListener('wheel', closeOnScroll);
      window.removeEventListener('touchmove', closeOnScroll);
    };
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    const query = inputRef.current?.value.trim();
    if (!query) return;

    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <button className="search-overlay__backdrop" type="button" aria-label="검색 닫기" onClick={onClose} />
      <section className="search-overlay" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <button className="search-overlay__close" type="button" aria-label="검색 닫기" onClick={onClose}>×</button>

        <div className="search-overlay__suggestions">
          <h2 id="search-title">제안 검색어</h2>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.label}>
                <a href={suggestion.url}>
                  <img className="search-overlay__arrow" src="/assets/icon-arrow-black.svg" alt="" />
                  <span>{suggestion.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form className="search-overlay__form" onSubmit={handleSubmit}>
          <input ref={inputRef} type="text" placeholder="SEARCH" aria-label="검색어 입력" />
          <button type="submit" aria-label="검색">
            <img src="/assets/icon-arrow-black.svg" alt="" />
          </button>
        </form>
      </section>
    </>
  );
}
