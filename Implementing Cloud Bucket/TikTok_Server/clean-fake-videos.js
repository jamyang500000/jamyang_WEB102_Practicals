// Delete only the seeded fake videos (example.com URLs). Keep all real uploads.
// Run from TikTok_Server folder:  node clean-fake-videos.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Find fake videos
  const fakeVideos = await prisma.video.findMany({
    where: { videoUrl: { contains: 'example.com' } },
    select: { id: true },
  });

  if (fakeVideos.length === 0) {
    console.log('No fake videos found. Nothing to delete.');
    await prisma.$disconnect();
    return;
  }

  const ids = fakeVideos.map((v) => v.id);
  console.log(`Deleting ${ids.length} fake (example.com) videos…`);

  // Delete dependent rows first (likes + comments + comment likes)
  // Cascade delete should handle this via schema, but doing it explicitly to be safe.
  const commentIds = (
    await prisma.comment.findMany({ where: { videoId: { in: ids } }, select: { id: true } })
  ).map((c) => c.id);

  if (commentIds.length) {
    await prisma.commentLike.deleteMany({ where: { commentId: { in: commentIds } } });
    await prisma.comment.deleteMany({ where: { id: { in: commentIds } } });
    console.log(`  → Deleted ${commentIds.length} comment(s)`);
  }

  await prisma.videoLike.deleteMany({ where: { videoId: { in: ids } } });
  await prisma.video.deleteMany({ where: { id: { in: ids } } });

  const remaining = await prisma.video.count();
  console.log(`Done. ${remaining} real video(s) remain in DB.`);

  await prisma.$disconnect();
})();
