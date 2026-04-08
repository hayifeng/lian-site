import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import type { Photo } from '../types';

interface UsePhotosResult {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  loadPhotos: () => Promise<void>;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
}

export function usePublicPhotos(initialPhotos?: Photo[]): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos || []);
  const [loading, setLoading] = useState(!initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPublicPhotos(1, 20);
      setPhotos(data.photos);
      setPage(1);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      // Keep sample data on error for demo
      if (photos.length === 0) {
        setPhotos(generateSamplePhotos(16));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await api.getPublicPhotos(nextPage, 20);
      setPhotos((prev) => [...prev, ...data.photos]);
      setPage(nextPage);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more photos');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (!initialPhotos) {
      loadPhotos();
    }
  }, [initialPhotos, loadPhotos]);

  return { photos, loading, error, loadPhotos, hasMore, page, loadMore };
}

interface UseMyPhotosResult {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  loadPhotos: () => Promise<void>;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
}

export function useMyPhotos(): UseMyPhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyPhotos(1, 100);
      setPhotos(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPhoto = useCallback((photo: Photo) => {
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return { photos, loading, error, loadPhotos, addPhoto, removePhoto };
}

// Generate sample photos for demo/fallback
function generateSamplePhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-${i}`,
    title: `示例照片 ${i + 1}`,
    filename: `sample_${i + 1}.jpg`,
    uploadPath: `https://picsum.photos/seed/sample${i + 1}/400/400`,
    originalName: `sample_${i + 1}.jpg`,
    fileSize: 0,
    mimeType: 'image/jpeg',
    isPublic: true,
    userId: '',
    user: { id: '', email: 'demo@example.com', name: '示例用户' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
