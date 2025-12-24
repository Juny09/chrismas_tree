import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';

function App() {
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [showGiftCard, setShowGiftCard] = useState(() => {
    // Auto-open gift card if 'wish' param exists in URL
    const params = new URLSearchParams(window.location.search);
    return params.has('wish');
  });

  const handlePhotoUpload = (photoUrl: string) => {
    setUserPhotos(prev => [...prev, photoUrl]);
  };

  return (
    <div className="relative w-screen h-screen bg-[#020403] overflow-hidden">
      <UIOverlay 
        onPhotoUpload={handlePhotoUpload} 
        showGiftCard={showGiftCard}
        onOpenGiftCard={() => setShowGiftCard(true)}
        onCloseGiftCard={() => setShowGiftCard(false)}
      />
      <Experience 
        userPhotos={userPhotos} 
        onGiftCardClick={() => setShowGiftCard(true)}
      />
    </div>
  );
}

export default App;