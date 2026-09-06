import { ko } from '../i18n/ko';

export const product = {
  slug: 'aren-mini-bag',
  name: ko.detailProduct.name, price: ko.detailProduct.price, category: ko.detailProduct.category,
  images: [
    { src: '/assets/product-detail-main.png', alt: ko.detailProduct.images[0] },
    { src: '/assets/product-detail-alt-1.png', alt: ko.detailProduct.images[1] },
    { src: '/assets/product-detail-alt-2.png', alt: ko.detailProduct.images[2] },
  ],
  colours: [{ name: 'Selected', hex: '#c4913a' }, { name: 'Black', hex: '#2c2c2c' }, { name: 'Brown', hex: '#8b5e3c' }, { name: 'Green', hex: '#5e7a6e' }],
  description: ko.detailProduct.description,
  details: ko.detailProduct.details,
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
  { ...ko.recommendations[0], image: '/assets/product-detail-alt-1.png' },
  { ...ko.recommendations[1], image: '/assets/product-detail-main.png' },
  { ...ko.recommendations[2], image: '/assets/product-detail-alt-2.png' },
];
