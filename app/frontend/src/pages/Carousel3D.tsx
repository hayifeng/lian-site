import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicPhotos } from '../hooks';

interface Photo {
  id: string;
  title?: string;
  uploadPath: string;
  user?: { name?: string };
}

export default function Carousel3D() {
  const { photos, loading } = usePublicPhotos();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<number | null>(null);

  // Generate fallback photos for demo
  const displayPhotos: Photo[] = photos.length > 0
    ? photos
    : Array.from({ length: 8 }, (_, i) => ({
        id: `demo-${i}`,
        title: `照片 ${i + 1}`,
        uploadPath: `https://picsum.photos/seed/carousel3d${i + 1}/500/350`,
        user: { name: '演示用户' },
      }));

  const cardCount = displayPhotos.length;

  // Auto play
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cardCount);
    }, 3500);
  }, [cardCount]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isHovered, startAutoPlay, stopAutoPlay]);

  // Mouse wheel control
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAutoPlay();

      setActiveIndex((prev) => {
        if (e.deltaY > 0 || e.deltaX > 0) {
          return (prev + 1) % cardCount;
        } else {
          return (prev - 1 + cardCount) % cardCount;
        }
      });

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => startAutoPlay(), 3000);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [cardCount, startAutoPlay, stopAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + cardCount) % cardCount);
        stopAutoPlay();
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % cardCount);
        stopAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardCount, stopAutoPlay]);

  // Calculate card positions and styles
  const getCardTransform = (index: number) => {
    const diff = ((index - activeIndex) % cardCount + cardCount) % cardCount;
    const normalizedDiff = diff <= cardCount / 2 ? diff : diff - cardCount;

    const angle = normalizedDiff * 35;
    const translateX = normalizedDiff * 180;
    const translateZ = -Math.abs(normalizedDiff) * 120;
    const scale = 1 - Math.abs(normalizedDiff) * 0.12;
    const opacity = Math.max(0.3, 1 - Math.abs(normalizedDiff) * 0.2);
    const brightness = Math.max(0.6, 1 - Math.abs(normalizedDiff) * 0.1);

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${angle * 0.3}deg) scale(${scale})`,
      opacity,
      filter: `brightness(${brightness})`,
      zIndex: cardCount - Math.abs(normalizedDiff),
      isActive: normalizedDiff === 0,
    };
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          3D 轮播画廊
        </h1>
        <p className="text-white/50 text-sm">
          滚动鼠标或点击切换 · 悬停查看详情
        </p>
      </div>

      {/* Loading state */}
      {loading && photos.length === 0 && (
        <div className="flex items-center justify-center gap-3 text-white/60 py-8">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      )}

      {/* 3D Carousel Container */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center"
        style={{ height: 'calc(100vh - 200px)', perspective: '1500px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: '100%', transformStyle: 'preserve-3d' }}
        >
          {displayPhotos.map((photo, index) => {
            const style = getCardTransform(index);

            return (
              <motion.div
                key={photo.id}
                className="absolute cursor-pointer"
                style={{
                  width: '420px',
                  height: '300px',
                  zIndex: style.zIndex,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  x: style.transform.match(/translateX\(([^)]+)\)/)?.[1] || '0px',
                  z: style.transform.match(/translateZ\(([^)]+)\)/)?.[1] || '0px',
                  rotateY: style.transform.match(/rotateY\(([^)]+)\)/)?.[1] || '0deg',
                  scale: style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1,
                  opacity: style.opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div
                  className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                    style.isActive
                      ? 'ring-4 ring-primary-400 ring-offset-4 ring-offset-transparent shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                      : 'shadow-xl'
                  }`}
                  style={{ filter: style.filter }}
                >
                  <img
                    src={photo.uploadPath}
                    alt={photo.title || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/500/350`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {style.isActive && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="text-white font-bold text-xl mb-1">
                          {photo.title || `照片 ${index + 1}`}
                        </h3>
                        {photo.user && (
                          <p className="text-white/70 text-sm">
                            by {photo.user.name || 'Unknown'}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                  {style.isActive && (
                    <motion.div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          onClick={() => {
            setActiveIndex((prev) => (prev - 1 + cardCount) % cardCount);
            stopAutoPlay();
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          onClick={() => {
            setActiveIndex((prev) => (prev + 1) % cardCount);
            stopAutoPlay();
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-3">
        {displayPhotos.map((_, index) => (
          <button
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-10 h-3 bg-primary-400'
                : 'w-3 h-3 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => {
              setActiveIndex(index);
              stopAutoPlay();
            }}
          />
        ))}
      </div>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                <img
                  src={selectedPhoto.uploadPath}
                  alt={selectedPhoto.title || 'Photo'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {selectedPhoto.title || '未命名照片'}
                </h3>
                {selectedPhoto.user && (
                  <p className="text-gray-500 mb-4">
                    by {selectedPhoto.user.name || 'Unknown'}
                  </p>
                )}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-xs">
        <span>↑↓ 滚动切换</span>
        <span className="w-px h-4 bg-white/30" />
        <span>← → 键盘切换</span>
        <span className="w-px h-4 bg-white/30" />
        <span>点击详情</span>
      </div>
    </div>
  );
}
