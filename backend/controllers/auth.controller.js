import bcrypt from 'bcrypt';
import { createUser, getUserByEmail } from '../models/user.model.js';
import { generateToken } from '../utils/token.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name)
    return res.status(400).json({ error: 'All fields required' });

  const existing = await getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hash });
  const token = generateToken(user);

  res.status(201).json({ user, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Incorrect password' });

  const token = generateToken(user);
  delete user.password;

  res.json({ user, token });
};

export { register, login };
