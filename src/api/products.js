import { request } from './client';

const productRequests = new Map();

export function getProduct(productId, signal) {
  const key = String(productId);
  if (!productRequests.has(key)) {
    const productRequest = request(`/api/products/${encodeURIComponent(productId)}`, {
      headers: { Accept: 'application/json' },
      signal,
    }).catch((error) => {
      productRequests.delete(key);
      throw error;
    });
    productRequests.set(key, productRequest);
  }
  return productRequests.get(key);
}
