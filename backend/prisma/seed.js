import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Bases
  const bases = [
    { name: 'Fort Alpha', location: 'Sector 4-North' },
    { name: 'Fort Bravo', location: 'Range Ridge' },
    { name: 'Camp Charlie', location: 'Coastal Perimeter' },
  ];

  const createdBases = [];
  for (const b of bases) {
    const base = await prisma.base.create({ data: b });
    createdBases.push(base);
    console.log(`Created base: ${base.name}`);
  }

  // 2. Create Equipment Types
  const equipmentTypes = [
    { name: 'M4 Carbine', category: 'WEAPON' },
    { name: 'Humvee', category: 'VEHICLE' },
    { name: '5.56mm Ammo', category: 'AMMUNITION' },
    { name: 'M240 Machine Gun', category: 'WEAPON' },
    { name: 'M1A2 Abrams Tank', category: 'VEHICLE' },
    { name: '120mm Tank Shell', category: 'AMMUNITION' },
  ];

  const createdEquipmentTypes = [];
  for (const et of equipmentTypes) {
    const type = await prisma.equipmentType.create({ data: et });
    createdEquipmentTypes.push(type);
    console.log(`Created equipment type: ${type.name}`);
  }

  // 3. Create Users with hashed passwords
  const users = [
    {
      username: 'admin_user',
      password: 'AdminPass123!',
      role: 'ADMIN',
      baseId: null,
    },
    {
      username: 'commander_alpha',
      password: 'CommandPass123!',
      role: 'BASE_COMMANDER',
      baseId: createdBases[0].id, // Fort Alpha
    },
    {
      username: 'commander_bravo',
      password: 'CommandPass123!',
      role: 'BASE_COMMANDER',
      baseId: createdBases[1].id, // Fort Bravo
    },
    {
      username: 'logistics_officer',
      password: 'LogisticsPass123!',
      role: 'LOGISTICS_OFFICER',
      baseId: createdBases[0].id, // Base #1
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        username: u.username,
        passwordHash,
        role: u.role,
        baseId: u.baseId,
      },
    });
    console.log(`Created user: ${user.username} (${user.role})`);
  }

  // 4. Create Initial Purchases to seed stock in Bases
  // Let's seed some purchases for Fort Alpha and Fort Bravo
  const m4RifleId = createdEquipmentTypes.find(e => e.name === 'M4 Carbine').id;
  const humveeId = createdEquipmentTypes.find(e => e.name === 'Humvee').id;
  const ammoId = createdEquipmentTypes.find(e => e.name === '5.56mm Ammo').id;

  const initialPurchases = [
    { baseId: createdBases[0].id, equipmentTypeId: m4RifleId, quantity: 150 },
    { baseId: createdBases[0].id, equipmentTypeId: humveeId, quantity: 12 },
    { baseId: createdBases[0].id, equipmentTypeId: ammoId, quantity: 10000 },
    { baseId: createdBases[1].id, equipmentTypeId: m4RifleId, quantity: 50 },
    { baseId: createdBases[1].id, equipmentTypeId: humveeId, quantity: 5 },
    { baseId: createdBases[1].id, equipmentTypeId: ammoId, quantity: 5000 },
  ];

  for (const p of initialPurchases) {
    await prisma.purchase.create({ data: p });
    // Initialize or increment Asset stock count
    await prisma.asset.upsert({
      where: {
        baseId_equipmentTypeId: {
          baseId: p.baseId,
          equipmentTypeId: p.equipmentTypeId,
        },
      },
      update: {
        quantity: { increment: p.quantity },
      },
      create: {
        baseId: p.baseId,
        equipmentTypeId: p.equipmentTypeId,
        quantity: p.quantity,
      },
    });
    console.log(`Seeded purchase: Base #${p.baseId}, Equipment #${p.equipmentTypeId}, Qty: ${p.quantity}`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
