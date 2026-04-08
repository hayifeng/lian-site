import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler.js';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth.js';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
});

// Validation schema
const photoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().optional(),
});

const updatePhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Get public photos (for display pages)
router.get('/public', optionalAuth, async (req, res, next) => {
  try {
    const parsed = photoQuerySchema.parse(req.query);
    const page = parsed.page;
    const limit = parsed.limit;
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.photo.count({ where: { isPublic: true } }),
    ]);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's photos (authenticated)
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const parsed = photoQuerySchema.parse(req.query);
    const page = parsed.page;
    const limit = parsed.limit;
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.photo.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Upload photo
router.post('/upload', authMiddleware, upload.single('photo'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const { title, description, isPublic = true } = req.body;

    const photo = await prisma.photo.create({
      data: {
        userId: req.userId!,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadPath: `/uploads/${req.file.filename}`,
        title: title || req.file.originalname,
        description,
        isPublic: isPublic === 'true' || isPublic === true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
});

// Get single photo
router.get('/:id', async (req, res, next) => {
  try {
    const photoId = req.params.id as string;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!photo) {
      throw createError('Photo not found', 404);
    }

    // Check if photo is public or belongs to the user
    const authReq = req as AuthRequest;
    if (!photo.isPublic && photo.userId !== authReq.userId) {
      throw createError('Photo not found', 404);
    }

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
});

// Update photo
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const photoId = req.params.id as string;
    const { title, description, isPublic } = updatePhotoSchema.parse(req.body);

    const existingPhoto = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!existingPhoto) {
      throw createError('Photo not found', 404);
    }

    if (existingPhoto.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    const photo = await prisma.photo.update({
      where: { id: photoId },
      data: { title, description, isPublic },
    });

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    next(error);
  }
});

// Delete photo
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const photoId = req.params.id as string;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw createError('Photo not found', 404);
    }

    if (photo.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    // Delete file from storage
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
