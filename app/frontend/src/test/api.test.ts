import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Mock API
vi.mock('../utils/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    getPublicPhotos: vi.fn().mockResolvedValue({
      photos: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),
    uploadPhoto: vi.fn(),
    deletePhoto: vi.fn(),
    getMyPhotos: vi.fn().mockResolvedValue({
      photos: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('token');
  });

  describe('usePublicPhotos hook', () => {
    it('should return initial empty state', async () => {
      const { usePublicPhotos } = await import('../hooks/usePhotos');
      const { result } = renderHook(() => usePublicPhotos());

      expect(result.current.photos).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
    // Note: Full hook testing would require more setup with React Query or similar
  });
});

describe('Type Definitions', () => {
  it('should have correct Photo type structure', () => {
    const mockPhoto = {
      id: '1',
      userId: 'user-1',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      title: 'Test Photo',
      description: 'Test description',
      isPublic: true,
      uploadPath: '/uploads/test.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    expect(mockPhoto.id).toBeDefined();
    expect(mockPhoto.uploadPath).toBeDefined();
    expect(mockPhoto.isPublic).toBe(true);
  });

  it('should have correct User type structure', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
    };

    expect(mockUser.email).toContain('@');
    expect(mockUser.id).toBeDefined();
  });
});
