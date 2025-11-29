import { useState, useEffect, type FormEvent } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/items';

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

  // Fetch all items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        const data: Item[] = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
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
    const itemData = {
      name,
      quantity,
      description: description.trim() === '' ? null : description,
    };

    try {
      // If we are editing, send a PUT request
      if (editingItem) {
        const response = await fetch(`${API_URL}/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        const updatedItem = await response.json();
        setItems(items.map(item => (item.id === updatedItem.id ? updatedItem : item)));
      } else {
        // Otherwise, send a POST request to create a new item
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        const newItem = await response.json();
        setItems([...items, newItem]);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity);
    setDescription(item.description || '');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Inventory Management</h1>

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
        <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
        {editingItem && <button type="button" onClick={resetForm}>Cancel Edit</button>}
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
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.description || 'N/A'}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;