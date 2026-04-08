// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
}

// Photo types
export interface Photo {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  title?: string;
  description?: string;
  isPublic: boolean;
  uploadPath: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    photos: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Upload types
export interface UploadResponse {
  photo: Photo;
}
