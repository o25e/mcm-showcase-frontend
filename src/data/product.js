export const product = {
  slug: 'aren-mini-bag',
  name: '스몰 크로스백', price: '₩625,000', category: 'MCM / 가방 / 스몰 크로스백',
  images: [
    { src: '/assets/product-detail-main.png', alt: '스몰 크로스백 메인 이미지' },
    { src: '/assets/product-detail-alt-1.png', alt: '스몰 크로스백 상세 이미지 1' },
    { src: '/assets/product-detail-alt-2.png', alt: '스몰 크로스백 상세 이미지 2' },
  ],
  colours: [{ name: 'Selected', hex: '#c4913a' }, { name: 'Black', hex: '#2c2c2c' }, { name: 'Brown', hex: '#8b5e3c' }, { name: 'Green', hex: '#5e7a6e' }],
  description: 'MCM 시그니처 비세토스 패턴으로 제작된 프리미엄 레더 아이템입니다. 골드 하드웨어와 함께 클래식한 무드를 완성합니다.',
  details: [
    ['소재 & 관리', '100% 풀그레인 소가죽. 마른 천으로 부드럽게 닦아주세요. 방수 스프레이 처리 권장.'],
    ['사이즈 & 규격', '가로 28cm · 세로 18cm · 폭 12cm. 어깨끈 조절 가능 (최대 120cm).'],
    ['배송 & 반품', '무료 배송 (2–3 영업일). 수령 후 14일 이내 미사용 상품 무료 반품 가능.'],
  ],
};
export const products = [
  product,
  {
    ...product, slug: 'visetos-tote', name: 'Visetos Tote Bag', price: '₩1,150,000',
    images: [
      { src: '/assets/product-detail-alt-1.png', alt: 'Visetos Tote Bag' },
      { src: '/assets/product-detail-main.png', alt: 'Visetos Tote Bag detail 1' },
      { src: '/assets/product-detail-alt-2.png', alt: 'Visetos Tote Bag detail 2' },
    ],
  },
  {
    ...product, slug: 'lxxvi-mini-bag', name: 'LXXVI Mini Bag', price: '₩950,000',
    images: [
      { src: '/assets/product-detail-alt-2.png', alt: 'LXXVI Mini Bag' },
      { src: '/assets/product-detail-alt-1.png', alt: 'LXXVI Mini Bag detail 1' },
      { src: '/assets/product-detail-main.png', alt: 'LXXVI Mini Bag detail 2' },
    ],
  },
  {
    ...product, slug: 'ottomar-visetos-wallet', name: 'Ottomar Visetos Wallet', price: '₩1,050,000',
    images: [
      { src: '/assets/figma-product.png', alt: 'Ottomar Visetos Wallet' },
      { src: '/assets/product-detail-main.png', alt: 'Ottomar Visetos Wallet detail 1' },
      { src: '/assets/product-detail-alt-1.png', alt: 'Ottomar Visetos Wallet detail 2' },
    ],
  },
];
export const recommendations = [
  { name: '비세토스 트로터', price: '₩1,150,000', image: '/assets/product-detail-alt-1.png' },
  { name: '클래식 쇼퍼', price: '₩985,000', image: '/assets/product-detail-main.png' },
  { name: 'LXXVI 미니백', price: '₩795,000', image: '/assets/product-detail-alt-2.png' },
];
