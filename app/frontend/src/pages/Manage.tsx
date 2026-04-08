import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import type { Photo } from '../types';

export default function Manage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPhotos();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyPhotos(1, 100);
      setPhotos(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载照片失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await uploadFiles(Array.from(files));
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = await api.uploadPhoto(files[i]);
        setPhotos((prev) => [photo, ...prev]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      await api.deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请重试');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">需要登录</h2>
          <p className="text-gray-500 mb-6">
            请先登录以访问照片管理功能
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            前往登录
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">照片管理</h1>
          <p className="text-gray-500">
            已上传 {photos.length} 张照片
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Upload Area */}
        <motion.div
          className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 ${
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`block text-center cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="text-5xl mb-4">
              {uploading ? '📤' : '🖼️'}
            </div>
            <p className="text-lg font-medium mb-2">
              {uploading ? '上传中...' : '点击或拖拽上传照片'}
            </p>
            <p className="text-sm text-gray-500">
              支持 JPG、PNG、GIF、WebP 格式，最大 10MB
            </p>
          </label>

          {/* Upload progress */}
          {uploading && uploadProgress > 0 && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                上传进度: {Math.round(uploadProgress)}%
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Photo Grid */}
        {photos.length === 0 && !isLoading ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-medium mb-2">还没有上传任何照片</h3>
            <p className="text-gray-500">
              点击上方区域或拖拽照片开始上传
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.uploadPath}
                  alt={photo.title || 'Photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.id}/300/300`;
                  }}
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {!photo.isPublic && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gray-900/70 text-white text-[10px] rounded">
                    私密
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">
                    {photo.title || photo.originalName}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Photo Detail Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                className="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  <img
                    src={selectedPhoto.uploadPath}
                    alt={selectedPhoto.title || 'Photo'}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    {selectedPhoto.title || selectedPhoto.originalName}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">文件大小:</span>{' '}
                      {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div>
                      <span className="font-medium">类型:</span>{' '}
                      {selectedPhoto.mimeType}
                    </div>
                    <div>
                      <span className="font-medium">上传时间:</span>{' '}
                      {new Date(selectedPhoto.createdAt).toLocaleString('zh-CN')}
                    </div>
                    <div>
                      <span className="font-medium">可见性:</span>{' '}
                      {selectedPhoto.isPublic ? '公开' : '私密'}
                    </div>
                  </div>

                  {selectedPhoto.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {selectedPhoto.description}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(selectedPhoto.id)}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      删除
                    </button>
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
