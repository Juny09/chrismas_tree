import React, { useState, useCallback } from 'react';
import { Experience } from '../components/Experience';
import { UIOverlay } from '../components/UIOverlay';

export const ChristmasPage: React.FC = () => {
  const [userPhotos, setUserPhotos] = useState<string[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPhoto = params.get('photo');
    return sharedPhoto ? [sharedPhoto] : [];
  });
  
  const [showGiftCard, setShowGiftCard] = useState(() => {
    // Auto-open gift card if 'wish' param exists in URL
    const params = new URLSearchParams(window.location.search);
    return params.has('wish');
  });

  const handlePhotoUpload = useCallback((photoUrl: string) => {
    setUserPhotos(prev => {
      // Avoid duplicates if possible
      if (prev.includes(photoUrl)) return prev;
      return [...prev, photoUrl];
    });
  }, []);

  // Get initial photo for UIOverlay
  const initialPhoto = new URLSearchParams(window.location.search).get('photo');

  return (
    <div className="relative w-full h-full bg-[#020403] overflow-hidden">
      <UIOverlay 
        onPhotoUpload={handlePhotoUpload} 
        showGiftCard={showGiftCard}
        onOpenGiftCard={() => setShowGiftCard(true)}
        onCloseGiftCard={() => setShowGiftCard(false)}
        initialPhoto={initialPhoto}
      />
      <Experience 
        userPhotos={userPhotos} 
        onGiftCardClick={() => setShowGiftCard(true)}
      />
    </div>
  );
};
