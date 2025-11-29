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

  console.log('Attempting DB connection:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
  });

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');

    switch (req.method) {
      case 'GET':
        try {
          const [rows] = await connection.query('SELECT * FROM items');
          res.status(200).json(rows);
        } catch (err) {
          console.error('Error fetching items:', err);
          res.status(500).json({ message: 'Failed to fetch items' });
        }
        break;

      case 'POST':
        try {
          const { name, quantity, description } = req.body;
          if (!name || quantity == null) {
            return res.status(400).json({ message: 'Name and quantity are required' });
          }

          const [result]: any = await connection.query(
            'INSERT INTO items (name, quantity, description) VALUES (?, ?, ?)',
            [name, quantity, description || null]
          );

          res.status(201).json({
            id: result.insertId,
            name,
            quantity,
            description: description || null,
          });
        } catch (err) {
          console.error('Error creating item:', err);
          res.status(500).json({ message: 'Failed to create item' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    console.error('Database connection failed:', message);
    res.status(500).json({ message: 'Database connection failed', error: message });
  } finally {
    if (connection) await connection.end();
  }
}
