export function getProductName(product, language) {
  const name = product?.name ?? product?.productName ?? '';
  const nameEn = product?.nameEn ?? product?.productNameEn;

  return language === 'en' && nameEn ? nameEn : name;
}

export function getProductNameLines(product, language, maxLength = 36) {
  const name = getProductName(product, language);

  if (language !== 'en' || name.length < maxLength) return [name];

  const words = name.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (currentLine && candidate.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [name];
}
