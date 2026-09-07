import { useEffect, useState } from 'react';
import { createAvatarLook } from '../api/recommendations';
import { API_BASE_URL } from '../api/config';
import { getArCopy } from '../components/arCopy';
import { ko } from '../i18n/ko';

const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';

export function resolveAvatarImageUrl(image) {
  if (typeof image !== 'string' || !image.trim()) return '';
  const trimmedImage = image.trim();
  return trimmedImage.startsWith('/') && !trimmedImage.startsWith('//')
    ? `${API_ASSET_BASE_URL}${trimmedImage}`
    : trimmedImage;
}

export function useAvatarGeneration({ arSessionId, onFinish, language }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const t = getArCopy(language);

  useEffect(() => {
    if (!isGenerating) return undefined;
    const controller = new AbortController();

    createAvatarLook(arSessionId, controller.signal)
      .then((data) => {
        const image = data.avatarImageUrl || data.avatarImage || data.imageUrl;
        if (!image || !data.styleProfileId) {
          throw new Error('Avatar look response is missing image or style profile');
        }
        onFinish?.({ ...data, avatarImageUrl: resolveAvatarImageUrl(image) });
      })
      .catch((generationError) => {
        if (generationError?.name === 'AbortError') return;
        console.error(ko.errors.avatarGenerationLog, generationError);
        setError(ko.errors.avatarGeneration);
        setIsGenerating(false);
      });

    return () => controller.abort();
  }, [arSessionId, isGenerating, onFinish]);

  return {
    isGenerating,
    startGeneration: () => setIsGenerating(true),
    error,
    setError,
    t,
  };
}
