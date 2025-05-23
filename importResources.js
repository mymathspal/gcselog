import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
// Upload Resources to the Database, and update current ones
const prisma = new PrismaClient();

async function importResources() {
  const filePath = path.join(process.cwd(), 'public', 'gcse_log_json.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const item of data) {
    const existing = await prisma.resource.findUnique({
      where: { resourceId: String(item["Resource ID"]) },
    });

    if (existing) {
      // Update all fields except averageRating
      await prisma.resource.update({
        where: { resourceId: String(item["Resource ID"]) },
        data: {
          type: item["Resource Type"],
          title: item["Resource Title"],
          level: item["Study Level"],
          subject: item["Subject"],
          examBoard: item["Exam Board"],
          link: item["Link"],
          author: item["Resource Author"],
          description: item["Resource Description"],
          // Skip averageRating on purpose, prevents database from overriding current rating 
        },
      });
      console.log(`Updated resource ID ${item["Resource ID"]}`);
    } else {
      await prisma.resource.create({
        data: {
          resourceId: String(item["Resource ID"]),
          type: item["Resource Type"],
          title: item["Resource Title"],
          level: item["Study Level"],
          subject: item["Subject"],
          examBoard: item["Exam Board"],
          link: item["Link"],
          author: item["Resource Author"],
          description: item["Resource Description"],
          averageRating: item["Average Rating"] || 0,
        },
      });
      console.log(`Imported new resource ID ${item["Resource ID"]}`);
    }
  }

  await prisma.$disconnect();
}

importResources().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
