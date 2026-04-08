import { Router } from 'express';

const router = Router();

// API Documentation
router.get('/', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Photo Sharing API',
      version: '1.0.0',
      description: 'API for personal photo sharing website',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                  },
                },
                example: {
                  email: 'user@example.com',
                  password: 'password123',
                  name: 'John Doe',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid input or email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
                example: {
                  email: 'user@example.com',
                  password: 'password123',
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'User data' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/photos/public': {
        get: {
          tags: ['Photos'],
          summary: 'Get public photos',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: 'Paginated list of public photos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          photos: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Photo' },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              page: { type: 'integer' },
                              limit: { type: 'integer' },
                              total: { type: 'integer' },
                              totalPages: { type: 'integer' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/photos/upload': {
        post: {
          tags: ['Photos'],
          summary: 'Upload a photo',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    photo: { type: 'string', format: 'binary' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    isPublic: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Photo uploaded successfully' },
            400: { description: 'No file uploaded or invalid file type' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/photos/{id}': {
        delete: {
          tags: ['Photos'],
          summary: 'Delete a photo',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Photo deleted successfully' },
            403: { description: 'Not authorized to delete this photo' },
            404: { description: 'Photo not found' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Photo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            fileSize: { type: 'integer' },
            mimeType: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            isPublic: { type: 'boolean' },
            uploadPath: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  });
});

export default router;
