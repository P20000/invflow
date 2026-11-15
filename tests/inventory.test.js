const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const inventoryStore = require('../src/models/inventory');

test.beforeEach(() => {
  // Reset store to known seeded state before each test
  inventoryStore.reset();
});

test('GET /health - should return UP status', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'UP');
  assert.ok(res.body.timestamp);
});

test('GET /api/inventory - should return seeded inventory items', async () => {
  const res = await request(app).get('/api/inventory');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test('GET /api/inventory/stats - should return calculated inventory metrics', async () => {
  const res = await request(app).get('/api/inventory/stats');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const stats = res.body.data;
  assert.ok(stats.totalItems > 0);
  assert.ok(stats.totalUnits > 0);
  assert.ok(stats.totalValue > 0);
  assert.ok(Array.isArray(stats.categories));
});

test('POST /api/inventory - should create a new inventory item', async () => {
  const newItem = {
    name: 'Logitech MX Master 3S',
    sku: 'LOGI-MX-3S',
    category: 'Electronics',
    quantity: 20,
    minThreshold: 5,
    price: 99.99
  };

  const res = await request(app)
    .post('/api/inventory')
    .send(newItem);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.name, newItem.name);
  assert.equal(res.body.data.sku, newItem.sku);
  assert.equal(res.body.data.quantity, 20);
});

test('POST /api/inventory - should reject duplicate SKU', async () => {
  const duplicate = {
    name: 'Duplicate Item',
    sku: 'TECH-MSE-01', // already seeded
    category: 'Electronics',
    quantity: 10,
    minThreshold: 5,
    price: 10
  };

  const res = await request(app)
    .post('/api/inventory')
    .send(duplicate);

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /already in use/i);
});

test('PATCH /api/inventory/:id/stock - should adjust stock and reject negative result', async () => {
  // Seeded item 1 starts with 35 quantity
  const resAdd = await request(app)
    .patch('/api/inventory/1/stock')
    .send({ amount: 15 });

  assert.equal(resAdd.status, 200);
  assert.equal(resAdd.body.data.quantity, 50);

  // Attempting to deduct more than available (50 + -100 < 0)
  const resNegative = await request(app)
    .patch('/api/inventory/1/stock')
    .send({ amount: -100 });

  assert.equal(resNegative.status, 400);
  assert.equal(resNegative.body.success, false);
  assert.match(resNegative.body.error, /insufficient stock/i);
});

test('PUT /api/inventory/:id - should update item details', async () => {
  const updatePayload = {
    name: 'Updated Mouse Pro',
    price: 49.99
  };

  const res = await request(app)
    .put('/api/inventory/1')
    .send(updatePayload);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.name, 'Updated Mouse Pro');
  assert.equal(res.body.data.price, 49.99);
});

test('DELETE /api/inventory/:id - should delete item from store', async () => {
  const res = await request(app).delete('/api/inventory/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  // Verify it no longer exists
  const resCheck = await request(app).get('/api/inventory/1');
  assert.equal(resCheck.status, 404);
});
