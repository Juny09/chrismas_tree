import React, { useRef, useState } from 'react';
import { Sparkles as SparklesIcon, Loader2, Play, Pause, Music2, Gift, Camera, X, SkipForward, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from '../types';
import { generateLuxuryWish } from '../services/geminiService';

const PLAYLIST = [
  { title: "Jingle Bells", url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Jingle%20Bells.mp3" },
  { title: "We Wish You A Merry Christmas", url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/We%20Wish%20You.mp3" },
  { title: "Deck the Halls", url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Deck%20the%20Halls%20B.mp3" },
  // { title: "Silent Night", url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Silent%20Night.mp3" }
];

interface UIOverlayProps {
  onPhotoUpload?: (url: string) => void;
  showGiftCard: boolean;
  onOpenGiftCard: () => void;
  onCloseGiftCard: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ onPhotoUpload, showGiftCard, onOpenGiftCard, onCloseGiftCard }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [wish, setWish] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle track change
  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    setCustomUrl(null); // Reset custom URL when cycling
    // Auto play new track
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setAudioPlaying(true);
      }
    }, 100);
  };

  const handleCustomMusic = () => {
    const url = prompt("Enter an online MP3 URL (e.g., https://example.com/song.mp3):");
    if (url && url.trim().startsWith('http')) {
      setCustomUrl(url.trim());
      setAudioPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 100);
    }
  };

  // Auto-play music on mount
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = 0.4; // Set reasonable default volume

    const attemptPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioPlaying(true);
            // Remove listeners once playing
            ['click', 'touchstart', 'keydown'].forEach(event => 
              document.removeEventListener(event, attemptPlay, { capture: true } as any)
            );
          })
          .catch((error) => {
            console.log("Autoplay prevented by browser:", error);
            setAudioPlaying(false);
          });
      }
    };

    // Try to play immediately
    attemptPlay();
    
    // Also try to play on any first interaction (capture phase to ensure we catch it)
    ['click', 'touchstart', 'keydown'].forEach(event => 
      document.addEventListener(event, attemptPlay, { capture: true, once: true })
    );

    return () => {
      ['click', 'touchstart', 'keydown'].forEach(event => 
        document.removeEventListener(event, attemptPlay, { capture: true } as any)
      );
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audioPlaying) {
        audio.pause();
        setAudioPlaying(false);
      } else {
        await audio.play();
        setAudioPlaying(true);
      }
    } catch (_) {
      // Handle mobile autoplay restrictions
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(LoadingState.GENERATING);
    setWish(null);

    const generatedWish = await generateLuxuryWish(name);
    
    setWish(generatedWish);
    setLoading(LoadingState.COMPLETE);
  };

  return (
    <main className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Header - Fixed */}
      <header className="absolute top-8 left-0 right-0 text-center space-y-2 animate-fade-in-down pointer-events-none">
        <h3 className="font-cinzel tracking-[0.3em] text-[10px] md:text-xs text-emerald-400 opacity-80 uppercase">
          Merry Christmas
        </h3>
        {/* Title removed to keep it clean */}
      </header>

      {/* Audio Control - Fixed Bottom Left */}
      <div className="pointer-events-auto absolute left-6 bottom-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-200/80">
          <button onClick={toggleAudio} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-[#FFD700]/30 backdrop-blur-sm transition-all hover:bg-black/60 hover:border-[#FFD700]/60">
            {audioPlaying ? <Pause className="w-3.5 h-3.5 text-[#FFD700]" /> : <Play className="w-3.5 h-3.5 text-[#FFD700]" />}
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-[#FFD700]">
              {audioPlaying ? 'Pause' : 'Play'}
            </span>
          </button>

          <button onClick={nextTrack} className="p-1.5 rounded-full bg-black/40 border border-[#FFD700]/30 backdrop-blur-sm transition-all hover:bg-black/60 hover:border-[#FFD700]/60" title="Next Song">
            <SkipForward className="w-3.5 h-3.5 text-[#FFD700]" />
          </button>

          <button onClick={handleCustomMusic} className="p-1.5 rounded-full bg-black/40 border border-[#FFD700]/30 backdrop-blur-sm transition-all hover:bg-black/60 hover:border-[#FFD700]/60" title="Enter Custom MP3 URL">
            <LinkIcon className="w-3.5 h-3.5 text-[#FFD700]" />
          </button>

          <button onClick={onOpenGiftCard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-[#FFD700]/30 backdrop-blur-sm transition-all hover:bg-black/60 hover:border-[#FFD700]/60">
            <Gift className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-[#FFD700]">Write Wish</span>
          </button>
        </div>
        
        {/* Now Playing Label */}
        <div className="px-2">
          <span className="text-[9px] font-cinzel text-[#FFD700]/60 uppercase tracking-wider">
            Now Playing: {customUrl ? 'Custom Track' : PLAYLIST[currentTrackIndex].title}
          </span>
        </div>
      </div>

      {/* Gift Card Modal - Centered */}
      <AnimatePresence>
        {showGiftCard && (
          <div className="absolute inset-0 pointer-events-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm"
            >
              {/* Card Visuals */}
              <div className="relative overflow-hidden rounded-xl bg-[#0f1c15]/95 border border-[#FFD700]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-70" />
                
                {/* Close Button */}
                <button 
                  onClick={onCloseGiftCard}
                  className="absolute top-3 right-3 text-[#FFD700]/50 hover:text-[#FFD700] transition-colors z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Corner Holly Decoration (CSS radial gradient simulation) */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#B71C1C] to-transparent rounded-full opacity-20 blur-xl" />

                <div className="p-6 relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6 opacity-90">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#FFD700]" />
                      <span className="font-cinzel text-xs tracking-widest text-[#FFD700] uppercase">
                        Gift Card
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pr-6"> {/* Added padding right for close button */}
                       {/* Upload Button */}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 group/upload"
                        title="Add Photo to Tree"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#FFD700]/70 group-hover/upload:text-[#FFD700] transition-colors" />
                        <span className="text-[10px] font-cinzel text-[#FFD700]/70 group-hover/upload:text-[#FFD700] uppercase tracking-wider">
                          Add Photo
                        </span>
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {!wish ? (
                    <form onSubmit={handleGenerate} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="recipient" className="block font-cinzel text-[10px] tracking-[0.2em] text-emerald-100/60 uppercase pl-1">
                          To:
                        </label>
                        <input
                          id="recipient"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name..."
                          className="w-full bg-white/5 border border-[#FFD700]/20 rounded-lg px-4 py-3 text-base font-playfair text-[#FFF5D1] placeholder:text-white/20 focus:outline-none focus:border-[#FFD700]/60 focus:bg-white/10 transition-all"
                          autoComplete="off"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading === LoadingState.GENERATING || !name}
                        className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] p-[1px] shadow-lg transition-all hover:shadow-[#FFD700]/20 disabled:opacity-50"
                      >
                        <div className="relative flex items-center justify-center gap-2 rounded-lg bg-[#0f1c15] px-4 py-3 transition-all group-hover:bg-opacity-90">
                          {loading === LoadingState.GENERATING ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
                          ) : (
                            <>
                              <SparklesIcon className="w-4 h-4 text-[#FFD700]" />
                              <span className="font-cinzel text-xs tracking-widest text-[#FFD700] group-hover:text-white transition-colors">
                                OPEN WISH
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                  ) : (
                    <div className="text-center space-y-6 animate-fade-in">
                      <div className="py-2 space-y-4">
                        <p className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-100/50 uppercase">
                          Warmest Wishes For {name}
                        </p>
                        <div className="relative">
                          <span className="absolute -top-2 -left-1 text-3xl text-[#FFD700]/20 font-serif">“</span>
                          <p className="font-playfair text-xl leading-relaxed text-[#FFF5D1] italic px-4">
                            {wish}
                          </p>
                          <span className="absolute -bottom-4 -right-1 text-3xl text-[#FFD700]/20 font-serif">”</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setWish(null);
                            setName('');
                            setLoading(LoadingState.IDLE);
                          }}
                          className="text-[10px] font-cinzel tracking-widest text-[#FFD700]/50 hover:text-[#FFD700] transition-colors border-b border-transparent hover:border-[#FFD700]"
                        >
                          WRITE ANOTHER
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audio Element - Jingle Bells */}
      <audio 
        ref={audioRef} 
        src={customUrl || PLAYLIST[currentTrackIndex].url} 
        preload="auto" 
        loop 
        onError={(e) => {
          console.error("Audio playback error:", e.currentTarget.error);
          setAudioPlaying(false);
        }}
      />
    </main>
  );
};
