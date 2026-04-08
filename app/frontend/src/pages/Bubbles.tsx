import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { usePublicPhotos } from '../hooks';

interface Photo {
  id: string;
  title?: string;
  uploadPath: string;
  user?: { name?: string };
}

interface BubblePosition {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  floatOffset: number;
}

const generatePosition = (index: number, containerWidth: number, containerHeight: number, isMobile: boolean): BubblePosition => {
  const seed = index * 137.508 + 17;
  const pseudoRandom = (n: number) => {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };

  // Smaller sizes for mobile
  const size = isMobile ? 50 + pseudoRandom(seed + 1) * 30 : 70 + pseudoRandom(seed + 1) * 50;
  const padding = isMobile ? 20 : 60;

  return {
    x: padding + pseudoRandom(seed) * (containerWidth - size - padding * 2),
    y: padding + pseudoRandom(seed + 2) * (containerHeight - size - padding * 2),
    size,
    delay: pseudoRandom(seed + 3) * 2,
    duration: 3 + pseudoRandom(seed + 4) * 2,
    floatOffset: pseudoRandom(seed + 5) * Math.PI * 2,
  };
};

// Extend photos for visual effect
const extendPhotos = (photos: Photo[]): Photo[] => {
  if (photos.length === 0) {
    return Array.from({ length: 24 }, (_, i) => ({
      id: `demo-${i}`,
      title: `用户 ${i + 1}`,
      uploadPath: `https://picsum.photos/seed/bubble${i + 1}/200/200`,
      user: { name: `用户 ${i + 1}` },
    }));
  }

  const extended = [...photos];
  for (let i = 0; i < 12; i++) {
    const photo = photos[i % photos.length];
    extended.push({
      ...photo,
      id: `${photo.id}-ext-${i}`,
      title: `${photo.user?.name || '用户'}`,
      uploadPath: `https://picsum.photos/seed/${photo.id}-${i}/200/200`,
    });
  }
  return extended;
};

export default function Bubbles() {
  const { photos, loading } = usePublicPhotos();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(16);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  const displayPhotos = extendPhotos(photos);
  const visiblePhotos = displayPhotos.slice(0, loadedCount);

  // Detect mobile and update size
  useEffect(() => {
    const updateSize = () => {
      const isMob = window.innerWidth < 640;
      setIsMobile(isMob);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: isMob ? 400 : Math.max(600, rect.height),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Infinite scroll / dynamic loading
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 300) {
        setLoadedCount((prev) => Math.min(prev + 8, displayPhotos.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayPhotos.length]);

  const handleClick = (photo: Photo) => {
    console.log('Navigate to user photos:', photo.id, photo.title);
  };

  return (
    <div className="relative min-h-[200vh]">
      {/* Animated gradient background with parallax */}
      <motion.div
        className="fixed inset-0 -z-10"
        style={{ y: bgY, opacity: bgOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-950/50 dark:to-slate-900" />
        <div className={`absolute ${isMobile ? 'w-40 h-40' : 'w-64 h-64'} top-1/4 left-1/4 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute ${isMobile ? 'w-48 h-48' : 'w-80 h-80'} bottom-1/3 right-1/4 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
      </motion.div>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 py-6 sm:py-8 text-center backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={`font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl'} mb-2`}>
          泡泡头像墙
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
          悬停聚焦 · 点击筛选
        </p>
        {loading && photos.length === 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-5 h-5 border-2 border-purple-400/50 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">加载中...</span>
          </div>
        )}
      </motion.header>

      {/* Bubbles Container */}
      <div
        ref={containerRef}
        className="relative mx-auto max-w-7xl px-2 sm:px-4"
        style={{ minHeight: '70vh' }}
      >
        {visiblePhotos.map((photo, index) => {
          const pos = generatePosition(index, containerSize.width, containerSize.height, isMobile);
          const isHovered = hoveredId === photo.id;
          const isAnyHovered = hoveredId !== null && !isHovered;

          return (
            <motion.div
              key={photo.id}
              className="absolute cursor-pointer"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.size,
                height: pos.size,
                zIndex: isHovered ? 50 : 1,
              }}
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{
                opacity: isAnyHovered ? 0.5 : 1,
                scale: isHovered ? 1.4 : 1,
                y: [
                  Math.sin(pos.floatOffset) * (isMobile ? 4 : 8),
                  Math.sin(pos.floatOffset + Math.PI) * (isMobile ? 4 : 8),
                  Math.sin(pos.floatOffset) * (isMobile ? 4 : 8),
                ],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 300, damping: 20 },
                y: {
                  duration: pos.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: pos.delay,
                },
              }}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleClick(photo)}
            >
              <motion.div
                className="absolute -inset-2 rounded-full"
                animate={{
                  boxShadow: isHovered
                    ? '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.2)'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className={`w-full h-full rounded-full overflow-hidden border-2 sm:border-4 transition-colors duration-300 ${isMobile ? 'border-white/80' : ''}`}
                animate={{
                  borderColor: isHovered ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  filter: isHovered ? 'blur(0px)' : isAnyHovered ? 'blur(0.5px)' : 'blur(0px)',
                }}
              >
                <img
                  src={photo.uploadPath}
                  alt={photo.title || `Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/200/200`; }}
                />

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-purple-500/40 to-transparent flex items-end justify-center pb-2 sm:pb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="text-white text-[8px] sm:text-xs font-medium drop-shadow-md px-1">
                        {photo.title}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}

        {loadedCount < displayPhotos.length && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 py-6 sm:py-8">
            <motion.div
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>向下滚动加载更多</span>
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {false && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
