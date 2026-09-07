export default function AvatarPreview({ src, gender }) {
  return <img className={`fitting-page__avatar ${gender === 'MALE' ? 'fitting-page__avatar--male' : ''}`} src={src} alt="fitting avatar" />;
}
