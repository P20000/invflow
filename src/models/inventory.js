/**
 * Inventory Model & In-Memory Store
 */

class InventoryModel {
  constructor() {
    this.items = [];
    this.nextId = 1;
    this.seedInitialData();
  }

  seedInitialData() {
    const initialItems = [
      {
        name: 'Wireless Ergonomic Mouse',
        sku: 'TECH-MSE-01',
        category: 'Electronics',
        quantity: 35,
        minThreshold: 10,
        price: 29.99
      },
      {
        name: 'Mechanical RGB Keyboard',
        sku: 'TECH-KBD-02',
        category: 'Electronics',
        quantity: 14,
        minThreshold: 15,
        price: 79.99
      },
      {
        name: 'USB-C Multiport Adapter',
        sku: 'ACC-HUB-03',
        category: 'Accessories',
        quantity: 8,
        minThreshold: 12,
        price: 24.50
      },
      {
        name: '27-inch 4K UHD Monitor',
        sku: 'DISP-MON-04',
        category: 'Displays',
        quantity: 5,
        minThreshold: 6,
        price: 329.00
      },
      {
        name: 'Adjustable Standing Desk Mat',
        sku: 'FURN-MAT-05',
        category: 'Office',
        quantity: 42,
        minThreshold: 10,
        price: 39.99
      },
      {
        name: 'Noise Cancelling Headphones',
        sku: 'AUD-HPH-06',
        category: 'Electronics',
        quantity: 0,
        minThreshold: 8,
        price: 149.99
      }
    ];

    this.items = initialItems.map((item) => ({
      id: this.nextId++,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  reset() {
    this.items = [];
    this.nextId = 1;
    this.seedInitialData();
  }

  getAll({ search, category, lowStock } = {}) {
    let result = [...this.items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      result = result.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (lowStock === 'true' || lowStock === true) {
      result = result.filter((item) => item.quantity <= item.minThreshold);
    }

    return result;
  }

  getById(id) {
    const numId = Number(id);
    return this.items.find((item) => item.id === numId) || null;
  }

  create({ name, sku, category, quantity, minThreshold, price }) {
    if (!name || !sku) {
      throw new Error('Name and SKU are required');
    }

    const existingSku = this.items.find(
      (item) => item.sku.toLowerCase() === sku.toLowerCase()
    );
    if (existingSku) {
      throw new Error(`SKU "${sku}" is already in use`);
    }

    const newItem = {
      id: this.nextId++,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category ? category.trim() : 'General',
      quantity: Math.max(0, parseInt(quantity, 10) || 0),
      minThreshold: Math.max(0, parseInt(minThreshold, 10) || 5),
      price: Math.max(0, parseFloat(price) || 0.0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.items.push(newItem);
    return newItem;
  }

  update(id, data) {
    const item = this.getById(id);
    if (!item) return null;

    if (data.sku && data.sku.toLowerCase() !== item.sku.toLowerCase()) {
      const existingSku = this.items.find(
        (i) => i.sku.toLowerCase() === data.sku.toLowerCase() && i.id !== item.id
      );
      if (existingSku) {
        throw new Error(`SKU "${data.sku}" is already in use`);
      }
      item.sku = data.sku.trim().toUpperCase();
    }

    if (data.name !== undefined) item.name = data.name.trim();
    if (data.category !== undefined) item.category = data.category.trim();
    if (data.quantity !== undefined) item.quantity = Math.max(0, parseInt(data.quantity, 10) || 0);
    if (data.minThreshold !== undefined) item.minThreshold = Math.max(0, parseInt(data.minThreshold, 10) || 0);
    if (data.price !== undefined) item.price = Math.max(0, parseFloat(data.price) || 0.0);

    item.updatedAt = new Date().toISOString();
    return item;
  }

  adjustStock(id, amount) {
    const item = this.getById(id);
    if (!item) return null;

    const delta = parseInt(amount, 10);
    if (isNaN(delta)) {
      throw new Error('Adjustment amount must be an integer');
    }

    const newQuantity = item.quantity + delta;
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Current: ${item.quantity}, Attempted reduction: ${Math.abs(delta)}`);
    }

    item.quantity = newQuantity;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  delete(id) {
    const numId = Number(id);
    const index = this.items.findIndex((item) => item.id === numId);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  getStats() {
    const totalItems = this.items.length;
    const totalUnits = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = this.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const lowStockCount = this.items.filter(
      (item) => item.quantity > 0 && item.quantity <= item.minThreshold
    ).length;
    const outOfStockCount = this.items.filter((item) => item.quantity === 0).length;

    const categories = Array.from(
      new Set(this.items.map((item) => item.category))
    );

    return {
      totalItems,
      totalUnits,
      totalValue: Number(totalValue.toFixed(2)),
      lowStockCount,
      outOfStockCount,
      categories
    };
  }
}

const inventoryStore = new InventoryModel();
module.exports = inventoryStore;
