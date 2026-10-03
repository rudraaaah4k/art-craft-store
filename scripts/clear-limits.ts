import { prisma } from '../src/lib/prisma';
async function main() {
  const res = await prisma.loginAttempt.deleteMany({});
  console.log(`Deleted ${res.count} login attempts`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
