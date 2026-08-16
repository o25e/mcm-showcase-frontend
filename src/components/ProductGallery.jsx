export default function ProductGallery({ images, selectedImage, onSelect }) {
  const thumbnails = [images[1], images[0], images[2]];

  return (
    <div className="gallery">
      <div className="main-image-wrap">
        <img src={selectedImage.src} alt={selectedImage.alt} />
        <span className="tag">가방</span>
      </div>

      <div className="thumbnails" aria-label="상품 이미지 선택">
        {thumbnails.map((image) => (
          <button
            className={`thumbnail ${image.src === selectedImage.src ? 'selected' : ''}`}
            type="button"
            key={image.src}
            onClick={() => onSelect(image)}
            aria-label={image.alt}
          >
            <img src={image.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}