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
  // ⚡ CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://albit-final2.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Extract ID from URL: /api/items/:id
    const id = req.url?.split('/').pop();

    switch (req.method) {
      case 'GET':
        const [rows] = await connection.query('SELECT * FROM items');
        return res.status(200).json(rows);

      case 'POST':
        const { name, quantity, description } = req.body;
        if (!name || quantity == null) return res.status(400).json({ message: 'Name and quantity required' });
        const [result]: any = await connection.query(
          'INSERT INTO items (name, quantity, description) VALUES (?, ?, ?)',
          [name, quantity, description || null]
        );
        return res.status(201).json({ id: result.insertId, name, quantity, description });

      case 'PUT':
        if (!id) return res.status(400).json({ message: 'Missing item ID' });
        const { name: newName, quantity: newQty, description: newDesc } = req.body;
        await connection.query(
          'UPDATE items SET name=?, quantity=?, description=? WHERE id=?',
          [newName, newQty, newDesc || null, id]
        );
        const [updated]: any = await connection.query('SELECT * FROM items WHERE id=?', [id]);
        return res.status(200).json(updated[0]);

      case 'DELETE':
        if (!id) return res.status(400).json({ message: 'Missing item ID' });
        await connection.query('DELETE FROM items WHERE id=?', [id]);
        return res.status(200).json({ message: 'Item deleted' });

      default:
        res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    let message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message });
  } finally {
    if (connection) await connection.end();
  }
}
