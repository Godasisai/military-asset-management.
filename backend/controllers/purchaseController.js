import db from '../config/db.js';

export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Base ID, Equipment Type ID, and a positive quantity are required.' });
    }

    const bId = parseInt(baseId);
    const etId = parseInt(equipmentTypeId);
    const qty = parseInt(quantity);

    // Atomically execute Purchase insertion and Asset snapshot update
    const purchase = await db.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          baseId: bId,
          equipmentTypeId: etId,
          quantity: qty,
        },
      });

      await tx.asset.upsert({
        where: {
          baseId_equipmentTypeId: {
            baseId: bId,
            equipmentTypeId: etId,
          },
        },
        update: {
          quantity: { increment: qty },
        },
        create: {
          baseId: bId,
          equipmentTypeId: etId,
          quantity: qty,
        },
      });

      return newPurchase;
    });

    return res.status(201).json({
      message: 'Purchase recorded successfully',
      purchase,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    const purchases = await db.purchase.findMany({
      where: bId ? { baseId: bId } : undefined,
      include: {
        base: true,
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(purchases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
