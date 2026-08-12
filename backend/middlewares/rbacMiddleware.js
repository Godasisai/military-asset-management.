export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied: Insufficient authorization level."
      });
    }
    next();
  };
};

export const enforceBaseScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Admins & Logistics Officers can see all bases by default (or filter if specified)
  // Base Commanders are strictly scoped to their assigned base
  if (req.user.role === 'BASE_COMMANDER') {
    if (!req.user.baseId) {
      return res.status(403).json({ message: "Access Denied: No base assigned to this commander profile." });
    }

    // Force query context to user's assigned base
    req.query.baseId = String(req.user.baseId);

    // Guard body properties on mutations
    if (req.body) {
      if (req.body.baseId && Number(req.body.baseId) !== req.user.baseId) {
        return res.status(403).json({
          message: `Access Denied: You can only record events for your assigned base (Base #${req.user.baseId}).`
        });
      }
      
      // Transfers guard: source base must be the commander's base
      if (req.body.sourceBaseId && Number(req.body.sourceBaseId) !== req.user.baseId) {
        return res.status(403).json({
          message: `Access Denied: You can only initiate transfers out of your assigned base (Base #${req.user.baseId}).`
        });
      }
    }
  }

  next();
};
