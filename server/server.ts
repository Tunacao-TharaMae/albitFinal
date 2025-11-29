import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS (Allow Vercel Frontend)
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ===============================
//     RAILWAY MYSQL CONNECTION
// ===============================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

// TEST DB CONNECTION
db.getConnection()
  .then(() => console.log("Connected to Railway MySQL!"))
  .catch((err) => console.error("DB connection failed:", err));

// ===============================
//        INVENTORY CRUD
// ===============================

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const [rows]: any = await db.query("SELECT * FROM items");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create item
app.post("/api/items", async (req, res) => {
  const { name, quantity, description } = req.body;

  try {
    const [result]: any = await db.query(
      "INSERT INTO items (name, quantity, description) VALUES (?, ?, ?)",
      [name, quantity, description]
    );

    res.json({
      id: result.insertId,
      name,
      quantity,
      description,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update item
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, quantity, description } = req.body;

  try {
    await db.query(
      "UPDATE items SET name = ?, quantity = ?, description = ? WHERE id = ?",
      [name, quantity, description, id]
    );

    res.json({
      id,
      name,
      quantity,
      description,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM items WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
//       DEPARTMENTS CRUD
// ===============================

app.get("/departments", async (req, res) => {
  try {
    const [rows]: any = await db.query("SELECT * FROM departments");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/departments", async (req, res) => {
  const { abbreviation, name, description, status } = req.body;

  try {
    await db.query(
      "INSERT INTO departments (abbreviation, name, description, status) VALUES (?, ?, ?, ?)",
      [abbreviation, name, description, status]
    );

    res.json({ success: true, message: "Department added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
//         START SERVER
// ===============================

// Railway gives you a dynamic PORT
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
