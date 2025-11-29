// /api/items.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 3306,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    switch (req.method) {
      case 'GET':
        // Fetch all items
        const [rows] = await connection.query('SELECT * FROM items');
        res.status(200).json(rows);
        break;

      case 'POST':
        // Create new item
        const { name, quantity, description } = req.body;
        const [result]: any = await connection.query(
          'INSERT INTO items (name, quantity, description) VALUES (?, ?, ?)',
          [name, quantity, description]
        );
        res.status(201).json({
          id: result.insertId,
          name,
          quantity,
          description,
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
}
