import db from '../config/db.js';

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({ message: 'Base, equipment type, quantity, and expenditure reason are required.' });
    }

    const bId = parseInt(baseId);
    const etId = parseInt(equipmentTypeId);
    const qty = parseInt(quantity);

    const expenditure = await db.$transaction(async (tx) => {
      // 1. Verify stock exists and is sufficient
      const asset = await tx.asset.findUnique({
        where: {
          baseId_equipmentTypeId: {
            baseId: bId,
            equipmentTypeId: etId,
          },
        },
      });

      if (!asset || asset.quantity < qty) {
        throw new Error(`Insufficient stock for expenditure. Available: ${asset ? asset.quantity : 0}, Requested: ${qty}`);
      }

      // 2. Decrement stock
      await tx.asset.update({
        where: {
          baseId_equipmentTypeId: {
            baseId: bId,
            equipmentTypeId: etId,
          },
        },
        data: {
          quantity: { decrement: qty },
        },
      });

      // 3. Create Expenditure record
      const newExpenditure = await tx.expenditure.create({
        data: {
          baseId: bId,
          equipmentTypeId: etId,
          quantity: qty,
          reason,
        },
      });

      return newExpenditure;
    });

    return res.status(201).json({
      message: 'Expenditure logged successfully',
      expenditure,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    const expenditures = await db.expenditure.findMany({
      where: bId ? { baseId: bId } : undefined,
      include: {
        base: true,
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(expenditures);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
