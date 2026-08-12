import db from '../config/db.js';

export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !assignedTo) {
      return res.status(400).json({ message: 'Base, equipment type, quantity, and personnel name are required.' });
    }

    const bId = parseInt(baseId);
    const etId = parseInt(equipmentTypeId);
    const qty = parseInt(quantity);

    const assignment = await db.$transaction(async (tx) => {
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
        throw new Error(`Insufficient stock for assignment. Available: ${asset ? asset.quantity : 0}, Requested: ${qty}`);
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

      // 3. Create Assignment record
      const newAssignment = await tx.assignment.create({
        data: {
          baseId: bId,
          equipmentTypeId: etId,
          quantity: qty,
          assignedTo,
          status: 'ASSIGNED',
        },
      });

      return newAssignment;
    });

    return res.status(201).json({
      message: 'Assignment recorded successfully',
      assignment,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const returnAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required.' });
    }

    const aId = parseInt(assignmentId);

    const updatedAssignment = await db.$transaction(async (tx) => {
      // 1. Find the assignment
      const assignment = await tx.assignment.findUnique({
        where: { id: aId },
      });

      if (!assignment) {
        throw new Error('Assignment record not found');
      }

      if (assignment.status === 'RETURNED') {
        throw new Error('Equipment has already been returned');
      }

      // 2. Update assignment status
      const updated = await tx.assignment.update({
        where: { id: aId },
        data: {
          status: 'RETURNED',
        },
      });

      // 3. Re-increment stock at base
      await tx.asset.upsert({
        where: {
          baseId_equipmentTypeId: {
            baseId: assignment.baseId,
            equipmentTypeId: assignment.equipmentTypeId,
          },
        },
        update: {
          quantity: { increment: assignment.quantity },
        },
        create: {
          baseId: assignment.baseId,
          equipmentTypeId: assignment.equipmentTypeId,
          quantity: assignment.quantity,
        },
      });

      return updated;
    });

    return res.status(200).json({
      message: 'Equipment returned successfully',
      assignment: updatedAssignment,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { baseId } = req.query;
    const bId = baseId ? parseInt(baseId) : undefined;

    const assignments = await db.assignment.findMany({
      where: bId ? { baseId: bId } : undefined,
      include: {
        base: true,
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
