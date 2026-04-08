import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Photo,
  PaginatedResponse,
  UploadResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        const message =
          error.response?.data?.error?.message ||
          error.message ||
          'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error('Registration failed');
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error('Login failed');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<{ user: User }>>(
      '/auth/me'
    );
    if (response.data.data?.user) {
      return response.data.data.user;
    }
    throw new Error('Failed to get user');
  }

  // Photo endpoints
  async getPublicPhotos(
    page = 1,
    limit = 20
  ): Promise<{ photos: Photo[]; pagination: PaginationInfo }> {
    const response = await this.client.get<PaginatedResponse<Photo>>(
      '/photos/public',
      { params: { page, limit } }
    );
    return response.data.data as { photos: Photo[]; pagination: PaginationInfo };
  }

  async getMyPhotos(
    page = 1,
    limit = 20
  ): Promise<{ photos: Photo[]; pagination: PaginationInfo }> {
    const response = await this.client.get<PaginatedResponse<Photo>>(
      '/photos',
      { params: { page, limit } }
    );
    return response.data.data as { photos: Photo[]; pagination: PaginationInfo };
  }

  async getPhoto(id: string): Promise<Photo> {
    const response = await this.client.get<ApiResponse<{ photo: Photo }>>(
      `/photos/${id}`
    );
    if (response.data.data?.photo) {
      return response.data.data.photo;
    }
    throw new Error('Photo not found');
  }

  async uploadPhoto(
    file: File,
    title?: string,
    description?: string,
    isPublic = true
  ): Promise<Photo> {
    const formData = new FormData();
    formData.append('photo', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('isPublic', String(isPublic));

    const response = await this.client.post<ApiResponse<UploadResponse>>(
      '/photos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (response.data.data?.photo) {
      return response.data.data.photo;
    }
    throw new Error('Upload failed');
  }

  async updatePhoto(
    id: string,
    data: { title?: string; description?: string; isPublic?: boolean }
  ): Promise<Photo> {
    const response = await this.client.put<ApiResponse<{ photo: Photo }>>(
      `/photos/${id}`,
      data
    );
    if (response.data.data?.photo) {
      return response.data.data.photo;
    }
    throw new Error('Update failed');
  }

  async deletePhoto(id: string): Promise<void> {
    await this.client.delete(`/photos/${id}`);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient();
