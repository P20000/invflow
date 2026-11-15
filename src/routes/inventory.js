const express = require('express');
const router = express.Router();
const inventoryStore = require('../models/inventory');

// GET /api/inventory/stats - Get inventory overview summary
router.get('/stats', (req, res) => {
  try {
    const stats = inventoryStore.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/inventory - Get list of items with filters
router.get('/', (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const items = inventoryStore.getAll({ search, category, lowStock });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/inventory/:id - Get a single item
router.get('/:id', (req, res) => {
  try {
    const item = inventoryStore.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/inventory - Create a new item
router.post('/', (req, res) => {
  try {
    const { name, sku, category, quantity, minThreshold, price } = req.body;
    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and sku are required'
      });
    }

    const newItem = inventoryStore.create({
      name,
      sku,
      category,
      quantity,
      minThreshold,
      price
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/inventory/:id - Update item details
router.put('/:id', (req, res) => {
  try {
    const updated = inventoryStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/inventory/:id/stock - Adjust stock (increment or decrement)
router.patch('/:id/stock', (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        error: 'A numeric amount field is required'
      });
    }

    const updated = inventoryStore.adjustStock(req.params.id, amount);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', (req, res) => {
  try {
    const deleted = inventoryStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
