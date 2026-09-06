export default function ProductGallery({ images, selectedImage, onSelect }) {
  const thumbnails = [images[1], images[0], images[2]];

  return (
    <div className="gallery">
      <div className="main-image-wrap">
        <img src={selectedImage.src} alt={selectedImage.alt} />
        <span className="tag">{ko.product.category}</span>
      </div>

      <div className="thumbnails" aria-label={ko.product.images}>
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
import { ko } from '../i18n/ko';
