// Dump recent videos from the DB to see what URLs are stored.
// Run from TikTok_Server folder:  node check-videos.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      userId: true,
      caption: true,
      videoUrl: true,
      videoStoragePath: true,
      createdAt: true,
    },
  });

  console.log(`\n=== Latest ${videos.length} video(s) in DB ===\n`);
  for (const v of videos) {
    console.log(`#${v.id} (user ${v.userId}) — "${v.caption || '(no caption)'}"`);
    console.log(`   videoUrl:   ${v.videoUrl}`);
    console.log(`   storagePath: ${v.videoStoragePath}`);
    console.log(`   created:    ${v.createdAt.toISOString()}`);
    console.log('');
  }

  // Count by URL type
  const all = await prisma.video.findMany({ select: { videoUrl: true } });
  const supabase = all.filter((v) => v.videoUrl?.includes('supabase.co')).length;
  const example = all.filter((v) => v.videoUrl?.includes('example.com')).length;
  const localhost = all.filter((v) => v.videoUrl?.includes('localhost') || v.videoUrl?.startsWith('/uploads')).length;
  const other = all.length - supabase - example - localhost;

  console.log('=== URL breakdown ===');
  console.log(`  Supabase URLs:  ${supabase}`);
  console.log(`  example.com (fake seed): ${example}`);
  console.log(`  localhost/uploads: ${localhost}`);
  console.log(`  other:          ${other}`);
  console.log(`  TOTAL:          ${all.length}`);

  await prisma.$disconnect();
})();
