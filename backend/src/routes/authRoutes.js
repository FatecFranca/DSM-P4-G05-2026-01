import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username });
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    const token = jwt.sign(
      { username: username, id: 1 },
      process.env. JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', username);
    
    return res.status(200).json({ 
      message: 'Login successful',
      token:  token,
      username: username
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Login failed',
      error: error. message 
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Signup attempt:', { username });
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const token = jwt.sign(
      { username: username, id: Date.now() },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    console.log('Signup successful for:', username);
    
    return res.status(201).json({ 
      message: 'User created successfully',
      token: token,
      username: username
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      message: 'Signup failed',
      error: error.message 
    });
  }
});

export default router;