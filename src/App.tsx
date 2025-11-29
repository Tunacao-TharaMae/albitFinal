import { useState, useEffect, type FormEvent } from 'react';
import './App.css';

const API_URL = "https://albit-final2.vercel.app/api/items";

interface Item {
  id: number;
  name: string;
  quantity: number;
  description: string | null;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data: Item[] = await response.json();
        setItems(data);
      } catch (err) {
        setError('Error fetching items');
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  const resetForm = () => {
    setName('');
    setQuantity(1);
    setDescription('');
    setEditingItem(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const itemData = {
      name,
      quantity,
      description: description.trim() === '' ? null : description,
    };

    try {
      if (editingItem) {
        // Update item using query parameter
        const response = await fetch(`${API_URL}?id=${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to update item');
        const updatedItem = await response.json();
        setItems(items.map(item => (item.id === updatedItem.id ? updatedItem : item)));
        setMessage('Item updated successfully');
      } else {
        // Create new item
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to add item');
        const newItem = await response.json();
        setItems([...items, newItem]);
        setMessage('Item added successfully');
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity);
    setDescription(item.description || '');
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      setItems(items.filter(item => item.id !== id));
      setMessage('Item deleted successfully');
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1>Inventory Management</h1>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit} className="item-form">
        <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
          min="0"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-buttons">
          <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
          {editingItem && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="item-list">
        <h2>Inventory Items</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4}>No items found</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.description || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
