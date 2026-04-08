import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicPhotos } from '../hooks';

interface Photo {
  id: string;
  title?: string;
  uploadPath: string;
  user?: { name?: string };
}

export default function CircularGallery() {
  const { photos } = usePublicPhotos();
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate fallback photos for demo
  const displayPhotos: Photo[] = photos.length > 0
    ? photos
    : Array.from({ length: 16 }, (_, i) => ({
        id: `demo-${i}`,
        title: `照片 ${i + 1}`,
        uploadPath: `https://picsum.photos/seed/circular${i + 1}/200/200`,
        user: { name: '演示用户' },
      }));

  // Responsive radius
  const radius = isMobile ? 140 : 260;
  const itemCount = displayPhotos.length;
  const itemSize = isMobile ? 50 : 80;

  // Auto rotation animation
  const animateRotation = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    setRotation((prev) => prev + (deltaTime / 1000) * 2);
    animationRef.current = requestAnimationFrame(animateRotation);
  }, []);

  useEffect(() => {
    if (isAutoRotating && !hoveredIndex) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animateRotation);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAutoRotating, hoveredIndex, animateRotation]);

  // Mouse wheel rotation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setIsAutoRotating(false);
      setRotation((prev) => prev + (e.deltaY > 0 ? 8 : -8));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Touch controls for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      setIsAutoRotating(false);
      setRotation((prev) => prev + deltaY * 0.5);
      touchStartY.current = e.touches[0].clientY;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setRotation((prev) => prev + 15);
      else if (e.key === 'ArrowRight') setRotation((prev) => prev - 15);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i * 0.1) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-4 sm:mb-8 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          环形照片墙
        </h1>
        <p className="text-white/60 text-xs sm:text-sm">
          {isMobile ? '滑动旋转轨道 · 点击查看详情' : '滚动鼠标旋转轨道 · 点击查看详情'}
        </p>
      </div>

      {/* Gallery Container */}
      <div
        ref={containerRef}
        className={`relative touch-none select-none ${isMobile ? 'w-[320px] h-[320px]' : 'w-[600px] h-[600px]'}`}
        onMouseDown={() => setIsAutoRotating(false)}
      >
        {/* Orbital rings */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 ${isMobile ? 'w-[280px] h-[280px]' : 'w-[520px] h-[520px]'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20 ${isMobile ? 'w-[200px] h-[200px]' : 'w-[400px] h-[400px]'}`} />

        {/* Center core */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <div className={`${isMobile ? 'w-12 h-12' : 'w-24 h-24'} rounded-full bg-gradient-to-br from-primary-400 via-purple-500 to-pink-500 opacity-80 blur-sm`} />
        </motion.div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isMobile ? 'w-10 h-10' : 'w-20 h-20'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20`}>
          <span className={isMobile ? 'text-xl' : 'text-3xl'}>🌍</span>
        </div>

        {/* Photos on orbit */}
        {displayPhotos.map((photo, index) => {
          const baseAngle = (index / itemCount) * Math.PI * 2;
          const currentAngle = baseAngle + (rotation * Math.PI) / 180;
          const x = Math.cos(currentAngle) * radius;
          const y = Math.sin(currentAngle) * radius;
          const isHovered = hoveredIndex === index;
          const zIndex = Math.round((y / radius + 1) * 50);

          return (
            <motion.div
              key={photo.id}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                zIndex: isHovered ? 100 : zIndex,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.4 : 1,
                x: isHovered ? -itemSize / 2.8 : -itemSize / 2,
                y: isHovered ? -itemSize / 2.8 : -itemSize / 2,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onMouseEnter={() => { setHoveredIndex(index); setIsAutoRotating(false); }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedPhoto(photo)}
            >
              <motion.div
                className={`rounded-xl overflow-hidden cursor-pointer ${isHovered ? 'shadow-[0_0_30px_rgba(168,85,247,0.6)] ring-2 ring-white/50' : 'shadow-lg'}`}
                style={{ width: itemSize, height: itemSize }}
              >
                <img
                  src={photo.uploadPath}
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/200/200`; }}
                />
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-1 sm:p-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="text-white text-[8px] sm:text-[10px] font-medium truncate max-w-full">
                        {photo.title}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
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
              className="relative max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                <img src={selectedPhoto.uploadPath} alt={selectedPhoto.title || 'Photo'} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{selectedPhoto.title || '未命名照片'}</h3>
                {selectedPhoto.user && <p className="text-gray-500 text-sm mb-4">by {selectedPhoto.user.name}</p>}
                <button onClick={() => setSelectedPhoto(null)} className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint */}
      <div className="relative z-10 mt-4 sm:mt-8 flex items-center gap-2 sm:gap-4 text-white/50 text-[10px] sm:text-xs px-4">
        <span>↑↓ {isMobile ? '滑动' : '滚动'}</span>
        <span className="w-px h-4 bg-white/30" />
        <span>← → 键盘</span>
        <span className="w-px h-4 bg-white/30 hidden sm:inline" />
        <span className="hidden sm:inline">拖拽</span>
      </div>
    </div>
  );
}
