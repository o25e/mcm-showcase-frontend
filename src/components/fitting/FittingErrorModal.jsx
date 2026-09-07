import { ko } from '../../i18n/ko';

export default function FittingErrorModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="fitting-no-avatar-modal" role="presentation" onClick={onClose}>
      <div
        className="fitting-no-avatar-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fitting-no-avatar-title"
        onClick={(event) => event.stopPropagation()}
      >
        <img className="fitting-no-avatar-modal__logo" src="/assets/MCM-logo.png" alt="MCM" />
        <p id="fitting-no-avatar-title">{ko.fitting.noAvatar}<br />{ko.fitting.noAvatarHelp}</p>
        <button type="button" onClick={onClose}>{ko.fitting.confirm}</button>
      </div>
    </div>
  );
}
