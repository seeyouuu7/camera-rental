import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const PLACEHOLDER = "https://placehold.co/600x400/e5e7eb/9ca3af?text=";

async function main() {
  const cats = await Promise.all([
    prisma.category.create({ data: { name: "카메라",       slug: "camera",    sortOrder: 1 } }),
    prisma.category.create({ data: { name: "조명",         slug: "lighting",  sortOrder: 2 } }),
    prisma.category.create({ data: { name: "삼각대",       slug: "tripod",    sortOrder: 3 } }),
    prisma.category.create({ data: { name: "베이스",       slug: "base",      sortOrder: 4 } }),
    prisma.category.create({ data: { name: "반사판",       slug: "reflector", sortOrder: 5 } }),
    prisma.category.create({ data: { name: "배터리",       slug: "battery",   sortOrder: 6 } }),
    prisma.category.create({ data: { name: "카메라 가방",  slug: "bag",       sortOrder: 7 } }),
    prisma.category.create({ data: { name: "SD카드",       slug: "sdcard",    sortOrder: 8 } }),
    prisma.category.create({ data: { name: "짐벌",         slug: "gimbal",    sortOrder: 9 } }),
    prisma.category.create({ data: { name: "Roll Line",   slug: "rollline",  sortOrder: 10 } }),
    prisma.category.create({ data: { name: "랜",           slug: "lan",       sortOrder: 11 } }),
    prisma.category.create({ data: { name: "디렉터 모니터", slug: "monitor",  sortOrder: 12 } }),
  ]);

  const [camera, lighting, tripod, base, reflector, battery, bag, sdcard, gimbal, rollline, lan, monitor] = cats;

  const items: { name: string; categoryId: string }[] = [
    // 카메라
    { name: "FX3 1번",  categoryId: camera.id },
    { name: "FX3 2번",  categoryId: camera.id },
    { name: "A7M3 1번", categoryId: camera.id },
    { name: "A7M3 2번", categoryId: camera.id },
    // 조명
    { name: "조명 1번", categoryId: lighting.id },
    { name: "조명 2번", categoryId: lighting.id },
    // 삼각대
    ...Array.from({ length: 5 }, (_, i) => ({ name: `삼각대 ${i + 1}번`, categoryId: tripod.id })),
    // 베이스
    ...Array.from({ length: 13 }, (_, i) => ({ name: `베이스 ${i + 1}번`, categoryId: base.id })),
    // 반사판
    ...Array.from({ length: 4 }, (_, i) => ({ name: `반사판 ${i + 1}번`, categoryId: reflector.id })),
    // 배터리
    ...Array.from({ length: 7 }, (_, i) => ({ name: `배터리 A7 ${i + 1}번`, categoryId: battery.id })),
    { name: "LP-E8 1번", categoryId: battery.id },
    // 카메라 가방
    ...Array.from({ length: 4 }, (_, i) => ({ name: `카메라 가방 ${i + 1}번`, categoryId: bag.id })),
    // SD카드
    { name: "SD 128GB 1번", categoryId: sdcard.id },
    { name: "SD 128GB 2번", categoryId: sdcard.id },
    { name: "SD 64GB 1번",  categoryId: sdcard.id },
    { name: "SD 64GB 2번",  categoryId: sdcard.id },
    // 짐벌
    { name: "짐벌",          categoryId: gimbal.id },
    // Roll Line
    { name: "Roll Line",    categoryId: rollline.id },
    // 랜
    { name: "랜",            categoryId: lan.id },
    // 디렉터 모니터
    { name: "디렉터 모니터", categoryId: monitor.id },
  ];

  await prisma.equipment.createMany({
    data: items.map((item) => ({
      ...item,
      dailyPrice: 0,
      deposit: 0,
      stock: 1,
      images: [`${PLACEHOLDER}${encodeURIComponent(item.name)}`],
    })),
  });

  console.log(`Seeded ${items.length} equipment items across ${cats.length} categories`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
