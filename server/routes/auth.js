import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Login or switch demo user
router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT u.*, r.name as role_name, r.department as role_department FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?').get(email || 'ananya.sharma@mospi.gov.in');
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    token: `demo_jwt_token_${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
      roleId: user.role_id,
      roleName: user.role_name,
      xp: user.xp,
      level: user.level,
      levelNumber: user.level_number,
      streak: user.streak
    }
  });
});

// Current user profile
router.get('/me', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  const user = db.prepare('SELECT u.*, r.name as role_name, r.department as role_department FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?').get(userId);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// List all users for demo switching
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id').all();
  res.json(users);
});

export default router;
