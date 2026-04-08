import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Sample photos data (using picsum for demo)
  const samplePhotos = [
    { title: 'Mountain Sunrise', description: 'Beautiful sunrise over the mountains', seed: 10 },
    { title: 'Ocean Waves', description: 'Peaceful ocean waves at sunset', seed: 20 },
    { title: 'Forest Path', description: 'A winding path through the forest', seed: 30 },
    { title: 'City Night', description: 'Neon lights of the city at night', seed: 40 },
    { title: 'Desert Dunes', description: 'Golden sand dunes under blue sky', seed: 50 },
    { title: 'Autumn Leaves', description: 'Colorful autumn leaves', seed: 60 },
    { title: 'Snow Peak', description: 'Snow-capped mountain peak', seed: 70 },
    { title: 'Flower Garden', description: 'Colorful flower garden in bloom', seed: 80 },
    { title: 'Lakeside', description: 'Serene lakeside view', seed: 90 },
    { title: 'Starry Night', description: 'A night full of stars', seed: 100 },
    { title: 'Waterfall', description: 'Majestic waterfall', seed: 110 },
    { title: 'Beach Sunset', description: 'Golden sunset over the beach', seed: 120 },
  ];

  // Create photos for demo user
  for (const photo of samplePhotos) {
    await prisma.photo.create({
      data: {
        userId: user.id,
        filename: `sample_${photo.seed}.jpg`,
        originalName: `${photo.title}.jpg`,
        fileSize: Math.floor(Math.random() * 5000000) + 1000000,
        mimeType: 'image/jpeg',
        uploadPath: `https://picsum.photos/seed/${photo.seed}/800/600`,
        title: photo.title,
        description: photo.description,
        isPublic: true,
      },
    });
  }

  console.log(`✅ Created ${samplePhotos.length} sample photos`);

  // Create a second user
  const user2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice',
    },
  });
  console.log(`✅ Created user: ${user2.email}`);

  // Create photos for second user
  const alicePhotos = [
    { title: 'Morning Coffee', seed: 200 },
    { title: 'Book Stack', seed: 201 },
    { title: 'Art Gallery', seed: 202 },
    { title: 'Street Food', seed: 203 },
  ];

  for (const photo of alicePhotos) {
    await prisma.photo.create({
      data: {
        userId: user2.id,
        filename: `sample_${photo.seed}.jpg`,
        originalName: `${photo.title}.jpg`,
        fileSize: Math.floor(Math.random() * 3000000) + 500000,
        mimeType: 'image/jpeg',
        uploadPath: `https://picsum.photos/seed/${photo.seed}/800/600`,
        title: photo.title,
        isPublic: true,
      },
    });
  }

  console.log(`✅ Created ${alicePhotos.length} photos for Alice`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Demo accounts:');
  console.log('   - demo@example.com / demo123');
  console.log('   - alice@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
