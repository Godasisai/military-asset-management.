import db from '../config/db.js';

export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Source base, destination base, equipment type, and a positive quantity are required.' });
    }

    const srcBaseId = parseInt(sourceBaseId);
    const destBaseId = parseInt(destinationBaseId);
    const etId = parseInt(equipmentTypeId);
    const qty = parseInt(quantity);

    if (srcBaseId === destBaseId) {
      return res.status(400).json({ message: 'Source base and destination base must be different.' });
    }

    // Atomic transaction for transfer verification and stock execution
    const transfer = await db.$transaction(async (tx) => {
      // 1. Verify source base stock exists and is sufficient
      const sourceAsset = await tx.asset.findUnique({
        where: {
          baseId_equipmentTypeId: {
            baseId: srcBaseId,
            equipmentTypeId: etId,
          },
        },
      });

      if (!sourceAsset || sourceAsset.quantity < qty) {
        throw new Error(`Insufficient stock at source base. Available: ${sourceAsset ? sourceAsset.quantity : 0}, Requested: ${qty}`);
      }

      // 2. Decrement source stock
      await tx.asset.update({
        where: {
          baseId_equipmentTypeId: {
            baseId: srcBaseId,
            equipmentTypeId: etId,
          },
        },
        data: {
          quantity: { decrement: qty },
        },
      });

      // 3. Increment destination stock
      await tx.asset.upsert({
        where: {
          baseId_equipmentTypeId: {
            baseId: destBaseId,
            equipmentTypeId: etId,
          },
        },
        update: {
          quantity: { increment: qty },
        },
        create: {
          baseId: destBaseId,
          equipmentTypeId: etId,
          quantity: qty,
        },
      });

      // 4. Create Transfer record
      const newTransfer = await tx.transfer.create({
        data: {
          sourceBaseId: srcBaseId,
          destinationBaseId: destBaseId,
          equipmentTypeId: etId,
          quantity: qty,
          status: 'COMPLETED',
          initiatedById: userId,
        },
      });

      return newTransfer;
    });

    return res.status(201).json({
      message: 'Transfer completed successfully',
      transfer,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    const transfers = await db.transfer.findMany({
      where: bId
        ? {
            OR: [
              { sourceBaseId: bId },
              { destinationBaseId: bId },
            ],
          }
        : undefined,
      include: {
        sourceBase: true,
        destinationBase: true,
        equipmentType: true,
        initiatedBy: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(transfers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
