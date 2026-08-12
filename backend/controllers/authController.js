import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kristallball_super_secret_key_123!';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await db.user.findUnique({
      where: { username },
      include: { base: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token containing userId, role, and baseId
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Create a manual Audit Log entry for logins
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User ${user.username} logged in successfully`,
      },
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base ? user.base.name : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      include: { base: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base ? user.base.name : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
