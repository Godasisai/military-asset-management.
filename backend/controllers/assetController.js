import db from '../config/db.js';

export const getBases = async (req, res) => {
  try {
    const bases = await db.base.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(bases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getEquipmentTypes = async (req, res) => {
  try {
    const equipmentTypes = await db.equipmentType.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(equipmentTypes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;

    const bId = baseId ? parseInt(baseId) : undefined;
    const etId = equipmentTypeId ? parseInt(equipmentTypeId) : undefined;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Helper for adding date filters
    const getDateFilter = (before) => {
      const filter = {};
      if (before && start) {
        filter.lt = start;
      } else {
        if (start) filter.gte = start;
        if (end) filter.lte = end;
      }
      return Object.keys(filter).length > 0 ? filter : undefined;
    };

    // --- 1. OPENING BALANCE CALCULATION (Prior to startDate) ---
    let openingBalance = 0;
    if (start) {
      const priorPurchases = await db.purchase.aggregate({
        _sum: { quantity: true },
        where: {
          baseId: bId,
          equipmentTypeId: etId,
          createdAt: getDateFilter(true),
        },
      });

      const priorTransfersIn = await db.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          destinationBaseId: bId,
          equipmentTypeId: etId,
          status: 'COMPLETED',
          createdAt: getDateFilter(true),
        },
      });

      const priorTransfersOut = await db.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          sourceBaseId: bId,
          equipmentTypeId: etId,
          status: 'COMPLETED',
          createdAt: getDateFilter(true),
        },
      });

      const priorAssignments = await db.assignment.aggregate({
        _sum: { quantity: true },
        where: {
          baseId: bId,
          equipmentTypeId: etId,
          createdAt: getDateFilter(true),
          // Only count items that were still active (assigned) at the start date
          OR: [
            { status: 'ASSIGNED' },
            { status: 'RETURNED', updatedAt: { gte: start } },
          ],
        },
      });

      const priorExpenditures = await db.expenditure.aggregate({
        _sum: { quantity: true },
        where: {
          baseId: bId,
          equipmentTypeId: etId,
          createdAt: getDateFilter(true),
        },
      });

      const pQty = priorPurchases._sum.quantity || 0;
      const tiQty = priorTransfersIn._sum.quantity || 0;
      const toQty = priorTransfersOut._sum.quantity || 0;
      const aQty = priorAssignments._sum.quantity || 0;
      const eQty = priorExpenditures._sum.quantity || 0;

      openingBalance = pQty + tiQty - toQty - aQty - eQty;
    }

    // --- 2. CURRENT PERIOD AGGREGATIONS ---
    const currentPurchases = await db.purchase.aggregate({
      _sum: { quantity: true },
      where: {
        baseId: bId,
        equipmentTypeId: etId,
        createdAt: getDateFilter(false),
      },
    });

    const currentTransfersIn = await db.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        destinationBaseId: bId,
        equipmentTypeId: etId,
        status: 'COMPLETED',
        createdAt: getDateFilter(false),
      },
    });

    const currentTransfersOut = await db.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        sourceBaseId: bId,
        equipmentTypeId: etId,
        status: 'COMPLETED',
        createdAt: getDateFilter(false),
      },
    });

    const currentAssignments = await db.assignment.aggregate({
      _sum: { quantity: true },
      where: {
        baseId: bId,
        equipmentTypeId: etId,
        createdAt: getDateFilter(false),
        status: 'ASSIGNED', // Only subtract active assignments in current period
      },
    });

    const currentExpenditures = await db.expenditure.aggregate({
      _sum: { quantity: true },
      where: {
        baseId: bId,
        equipmentTypeId: etId,
        createdAt: getDateFilter(false),
      },
    });

    const purchases = currentPurchases._sum.quantity || 0;
    const transfersIn = currentTransfersIn._sum.quantity || 0;
    const transfersOut = currentTransfersOut._sum.quantity || 0;
    const assigned = currentAssignments._sum.quantity || 0;
    const expended = currentExpenditures._sum.quantity || 0;

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    return res.status(200).json({
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInventoryStatus = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    // Fetch assets table records (current cached snapshot)
    const assets = await db.asset.findMany({
      where: bId ? { baseId: bId } : undefined,
      include: {
        base: true,
        equipmentType: true,
      },
      orderBy: [
        { base: { name: 'asc' } },
        { equipmentType: { name: 'asc' } },
      ],
    });

    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    const logs = await db.auditLog.findMany({
      where: bId
        ? {
            user: {
              baseId: bId,
            },
          }
        : undefined,
      include: {
        user: {
          select: {
            username: true,
            role: true,
            base: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 entries
    });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
