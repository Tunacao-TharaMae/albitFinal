import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 3306,
};

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    switch (req.method) {
      case 'PUT':
        const { name, quantity, description } = req.body;
        await connection.query(
          'UPDATE items SET name = ?, quantity = ?, description = ? WHERE id = ?',
          [name, quantity, description, id]
        );
        res.status(200).json({ id, name, quantity, description });
        break;

      case 'DELETE':
        await connection.query('DELETE FROM items WHERE id = ?', [id]);
        res.status(200).json({ success: true });
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection?.end();
  }
}
