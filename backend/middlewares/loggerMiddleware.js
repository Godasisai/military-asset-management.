import db from '../config/db.js';

export const auditLogger = (req, res, next) => {
  // Capture the original send to hook into it
  const originalSend = res.send;

  res.send = function (body) {
    // Restore original send immediately
    res.send = originalSend;

    // Listen for response finish
    res.on('finish', async () => {
      // Log successful state-changing actions
      if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        try {
          if (req.user && req.user.id) {
            let action = 'MUTATION';
            let details = `${req.method} on ${req.originalUrl}`;

            const url = req.originalUrl;
            if (url.includes('/auth/login')) {
              action = 'LOGIN';
              details = `User ${req.body.username || req.user.id} logged in successfully`;
            } else if (url.includes('/purchases')) {
              action = 'PURCHASE';
              details = `Recorded purchase of ${req.body.quantity} items (Type ID: ${req.body.equipmentTypeId}) for Base ID ${req.body.baseId}`;
            } else if (url.includes('/transfers')) {
              action = 'TRANSFER';
              details = `Initiated transfer of ${req.body.quantity} items (Type ID: ${req.body.equipmentTypeId}) from Base ID ${req.body.sourceBaseId} to Base ID ${req.body.destinationBaseId}`;
            } else if (url.includes('/assignments')) {
              action = 'ASSIGNMENT';
              details = `Assigned ${req.body.quantity} items (Type ID: ${req.body.equipmentTypeId}) to "${req.body.assignedTo}" at Base ID ${req.body.baseId}`;
            } else if (url.includes('/expenditures')) {
              action = 'EXPENDITURE';
              details = `Expended ${req.body.quantity} items (Type ID: ${req.body.equipmentTypeId}) at Base ID ${req.body.baseId}. Reason: ${req.body.reason}`;
            }

            await db.auditLog.create({
              data: {
                userId: req.user.id,
                action,
                details
              }
            });
          }
        } catch (error) {
          console.error('Failed to log audit details:', error);
        }
      }
    });

    return originalSend.apply(this, arguments);
  };

  next();
};
