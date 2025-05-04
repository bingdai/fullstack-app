import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { User, CreateUserInput } from '../models/user';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await query<User[]>('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body as CreateUserInput;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const user = await query<User>(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );

      res.status(201).json(user[0]);
    } catch (error) {
      next(error);
    }
  }
}
