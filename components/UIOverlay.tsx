import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Download, Share2, Music, Volume2, VolumeX, Camera, Gift, X, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { generateLuxuryWish as generateChristmasWish } from '../services/geminiService';
import { uploadImage as uploadPhoto } from '../services/storageService';

const SONGS = [
  {
    title: "Jingle Bells",
    url: "https://archive.org/download/JingleBells3_20181206/Jingle%20Bells%203.mp3"
  },
  {
    title: "We Wish You a Merry Christmas",
    url: "https://archive.org/download/WeWishYou_20181206/We%20Wish%20You.mp3"
  },
  // {
  //   title: "Christmas Magic",
  //   url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=christmas-magic-126529.mp3"
  // }
];

interface UIOverlayProps {
  onNameChange?: (name: string) => void;
  onWishChange?: (wish: string) => void;
  onPhotoUpload?: (url: string) => void;
  initialPhoto?: string | null;
  showGiftCard: boolean;
  onOpenGiftCard: () => void;
  onCloseGiftCard: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  onNameChange, 
  onWishChange, 
  onPhotoUpload,
  initialPhoto,
  showGiftCard,
  onOpenGiftCard,
  onCloseGiftCard
}) => {
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showSongToast, setShowSongToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio Control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      if (!isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio playback prevented:", error);
            // Don't auto-mute here, let the user interaction handler retry
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, currentSongIndex]);

  // Global click listener for auto-play
  useEffect(() => {
    const handleGlobalClick = () => {
      // Always try to play on click, regardless of muted state (to initialize audio context)
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsMuted(false); // Successfully played, so unmute
          })
          .catch(console.error);
      }
    };

    window.addEventListener('click', handleGlobalClick, { once: true });
    window.addEventListener('touchstart', handleGlobalClick, { once: true });
    window.addEventListener('keydown', handleGlobalClick, { once: true }); // Also handle keyboard interaction

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('touchstart', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalClick);
    };
  }, []); // Remove dependency on isMuted to ensure listener attaches once and persists until interaction

  const handleNextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
    setShowSongToast(true);
    setTimeout(() => setShowSongToast(false), 3000);
    if (!isMuted && audioRef.current) {
      // Small delay to ensure src update
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
    }
  };

  // Check for shared content in URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedName = params.get('name');
    const sharedWish = params.get('wish');
    const sharedPhoto = params.get('photo');
    
    if (sharedName && sharedWish) {
      setName(sharedName);
      setWish(sharedWish);
      onNameChange?.(sharedName);
      onWishChange?.(sharedWish);
    }
    
    if (sharedPhoto) {
      setPreviewPhoto(sharedPhoto);
      // Commented out to prevent duplicate uploads/infinite loops when opening shared links
      // onPhotoUpload?.(sharedPhoto); 
    }
  }, [onNameChange, onWishChange, onPhotoUpload]);

  const handleGenerateWish = async () => {
    if (!name) return;
    
    setIsGenerating(true);
    try {
      const newWish = await generateChristmasWish(name);
      setWish(newWish);
      onWishChange?.(newWish);
    } catch (error) {
      console.error('Failed to generate wish:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewPhoto(objectUrl);
      
      // Upload to cloud
      const cloudUrl = await uploadPhoto(file);
      if (onPhotoUpload) {
        onPhotoUpload(cloudUrl);
        // Update preview to cloud URL once ready
        setPreviewPhoto(cloudUrl);
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShare = async () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (wish) params.set('wish', wish);
    if (previewPhoto && !previewPhoto.startsWith('blob:')) {
      params.set('photo', previewPhoto);
    }
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f1c15',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `christmas-wish-${name || 'card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      <audio 
        ref={audioRef} 
        loop 
        src={SONGS[currentSongIndex].url} 
      />

      {/* Top Controls */}
      <div className="absolute top-4 right-4 pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex gap-3">
          {/* Open Card Button - Only show if card is closed */}
          {!showGiftCard && (
            <button
              onClick={onOpenGiftCard}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-[#FFD700] hover:bg-white/20 transition-all duration-300"
              title="Open Gift Card"
            >
              <Gift size={24} />
            </button>
          )}

          {/* Next Song Control */}
          <button
            onClick={handleNextSong}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-[#FFD700] hover:bg-white/20 transition-all duration-300"
            title="Next Song"
          >
            <SkipForward size={24} />
          </button>

          {/* Music Control */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-[#FFD700] hover:bg-white/20 transition-all duration-300"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>

        {/* Song Toast */}
        <AnimatePresence>
          {showSongToast && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white/80 text-sm border border-white/10 flex items-center gap-2"
            >
              <Music size={14} className="text-[#FFD700]" />
              <span className="font-medium text-[#FFD700]">{SONGS[currentSongIndex].title}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Card Container */}
      <AnimatePresence>
        {showGiftCard && (
          <div className="w-full max-w-[90vw] md:max-w-md mx-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-[#0f1c15]/80 backdrop-blur-xl rounded-2xl border border-[#FFD700]/30 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Card Content */}
              <div ref={cardRef} className="p-6 md:p-8 relative">
                {/* Close Button */}
                <button 
                  onClick={onCloseGiftCard}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF0000]/10 rounded-full blur-3xl" />
            
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-block p-2 md:p-3 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-transparent mb-3 md:mb-4 border border-[#FFD700]/20">
                <Gift className="w-6 h-6 md:w-8 md:h-8 text-[#FFD700]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-white mb-2 tracking-wide">Christmas Magic</h1>
              <p className="text-white/60 text-xs md:text-sm font-light">Create your interactive holiday wish</p>
            </div>

            {/* Photo Preview in Card - Commented out as requested */}
            {/* 
            {previewPhoto && (
              <div className="mb-6 relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#FFD700]/20 shadow-inner group/photo">
                <img 
                  src={previewPhoto} 
                  alt="Preview" 
                  className="w-full h-full object-cover opacity-80 group-hover/photo:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c15] to-transparent opacity-60" />
              </div>
            )}
            */}

            {/* Input Form */}
            <div className="space-y-4 md:space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    onNameChange?.(e.target.value);
                  }}
                  placeholder="Enter your name..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 focus:bg-white/10 transition-all text-center font-serif text-base md:text-lg"
                />
                <div className="absolute inset-0 rounded-lg bg-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 md:gap-3 justify-center">
                <button
                  onClick={handleGenerateWish}
                  disabled={!name || isGenerating}
                  className="flex-1 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50 rounded-lg px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base"
                >
                  <Sparkles size={16} className={isGenerating ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
                  <span className="font-medium">Generate Wish</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-center gap-2 transition-all group text-sm md:text-base"
                >
                  <Camera size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Wish Text */}
              <AnimatePresence mode="wait">
                {wish && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="relative bg-gradient-to-b from-white/5 to-transparent rounded-lg p-4 md:p-6 border border-white/10">
                      <textarea
                        value={wish}
                        onChange={(e) => {
                          setWish(e.target.value);
                          onWishChange?.(e.target.value);
                        }}
                        className="w-full bg-transparent border-none text-white/90 text-center font-serif italic text-base md:text-lg leading-relaxed focus:outline-none resize-none"
                        rows={6}
                      />
                      <div className="absolute -top-2 -left-2 text-[#FFD700]/40 text-3xl md:text-4xl font-serif">"</div>
                      <div className="absolute -bottom-4 -right-2 text-[#FFD700]/40 text-3xl md:text-4xl font-serif">"</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Actions */}
              {wish && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 md:gap-3 pt-2 md:pt-4 border-t border-white/10"
                >
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-[#FFD700] hover:bg-[#FDB931] text-[#0f1c15] rounded-lg px-4 py-2.5 md:px-4 md:py-3 flex items-center justify-center gap-2 font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-[#FFD700]/20 text-sm md:text-base"
                  >
                    <Share2 size={18} />
                    Share Card
                  </button>
                  
                  <button
                    onClick={downloadCard}
                    className="px-3 py-2.5 md:px-4 md:py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02]"
                    title="Download Image"
                  >
                    <Download size={20} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Share Tooltip */}
          <AnimatePresence>
            {showShareTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-[#0f1c15] px-4 py-2 rounded-full text-sm font-bold shadow-xl z-50 flex items-center gap-2"
              >
                <Sparkles size={14} />
                Link copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
        )}
      </AnimatePresence>
    </div>
  );
};
