// InvFlow Frontend Client
const state = {
  items: [],
  categories: [],
  search: '',
  selectedCategory: 'All',
  lowStockOnly: false
};

// DOM Elements
const inventoryTableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const lowStockToggle = document.getElementById('lowStockToggle');

const statTotalItems = document.getElementById('statTotalItems');
const statTotalUnits = document.getElementById('statTotalUnits');
const statLowStock = document.getElementById('statLowStock');
const statTotalValue = document.getElementById('statTotalValue');

const itemModal = document.getElementById('itemModal');
const modalTitle = document.getElementById('modalTitle');
const itemForm = document.getElementById('itemForm');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const toastEl = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchInventory();
  bindEvents();
});

function bindEvents() {
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    fetchInventory();
  });

  categoryFilter.addEventListener('change', (e) => {
    state.selectedCategory = e.target.value;
    fetchInventory();
  });

  lowStockToggle.addEventListener('change', (e) => {
    state.lowStockOnly = e.target.checked;
    fetchInventory();
  });

  openAddModalBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  itemForm.addEventListener('submit', handleFormSubmit);
}

// Fetch Stats
async function fetchStats() {
  try {
    const res = await fetch('/api/inventory/stats');
    const json = await res.json();
    if (json.success) {
      const stats = json.data;
      statTotalItems.textContent = stats.totalItems;
      statTotalUnits.textContent = stats.totalUnits;
      statLowStock.textContent = stats.lowStockCount;
      statTotalValue.textContent = `$${stats.totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

      updateCategoryOptions(stats.categories);
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

function updateCategoryOptions(categories) {
  const currentVal = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="All">All Categories</option>';
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  if (categories.includes(currentVal)) {
    categoryFilter.value = currentVal;
  }
}

// Fetch Inventory Items
async function fetchInventory() {
  try {
    const params = new URLSearchParams();
    if (state.search) params.append('search', state.search);
    if (state.selectedCategory !== 'All') params.append('category', state.selectedCategory);
    if (state.lowStockOnly) params.append('lowStock', 'true');

    const res = await fetch(`/api/inventory?${params.toString()}`);
    const json = await res.json();

    if (json.success) {
      state.items = json.data;
      renderTable(json.data);
    }
  } catch (err) {
    console.error('Failed to fetch inventory:', err);
    inventoryTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color:#ef4444;">Failed to load items.</td></tr>`;
  }
}

// Render Table
function renderTable(items) {
  if (items.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 32px; color: #94a3b8;">
          No inventory items found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  inventoryTableBody.innerHTML = items
    .map((item) => {
      let statusBadge = '<span class="badge badge-instock">In Stock</span>';
      if (item.quantity === 0) {
        statusBadge = '<span class="badge badge-outofstock">Out of Stock</span>';
      } else if (item.quantity <= item.minThreshold) {
        statusBadge = `<span class="badge badge-lowstock">Low Stock (≤ ${item.minThreshold})</span>`;
      }

      return `
      <tr>
        <td><span class="sku-tag">${escapeHtml(item.sku)}</span></td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.category || 'General')}</td>
        <td><strong>${item.quantity}</strong> units</td>
        <td>$${Number(item.price).toFixed(2)}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="adjust-group">
            <button class="btn-adjust" onclick="adjustStock(${item.id}, -1)" title="Decrease stock">-</button>
            <button class="btn-adjust" onclick="adjustStock(${item.id}, 1)" title="Increase stock">+</button>
          </div>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" onclick="openEditModal(${item.id})">Edit</button>
            <button class="btn-icon btn-delete" onclick="deleteItem(${item.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

// Quick Adjust Stock
async function adjustStock(id, amount) {
  try {
    const res = await fetch(`/api/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to adjust stock');

    showToast(`Stock updated for ${json.data.name}`);
    fetchInventory();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Delete Item
async function deleteItem(id) {
  const item = state.items.find((i) => i.id === id);
  if (!confirm(`Are you sure you want to delete "${item?.name || 'this item'}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete item');

    showToast('Item deleted successfully');
    fetchInventory();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Modal Handlers
function openModal(item = null) {
  itemForm.reset();
  if (item) {
    modalTitle.textContent = 'Edit Inventory Item';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemSku').value = item.sku;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemThreshold').value = item.minThreshold;
  } else {
    modalTitle.textContent = 'Add Inventory Item';
    document.getElementById('itemId').value = '';
    document.getElementById('itemThreshold').value = '5';
    document.getElementById('itemQuantity').value = '10';
  }
  itemModal.classList.remove('hidden');
}

function openEditModal(id) {
  const item = state.items.find((i) => i.id === id);
  if (item) openModal(item);
}

function closeModal() {
  itemModal.classList.add('hidden');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('itemId').value;
  const payload = {
    name: document.getElementById('itemName').value,
    sku: document.getElementById('itemSku').value,
    category: document.getElementById('itemCategory').value,
    price: parseFloat(document.getElementById('itemPrice').value) || 0,
    quantity: parseInt(document.getElementById('itemQuantity').value, 10) || 0,
    minThreshold: parseInt(document.getElementById('itemThreshold').value, 10) || 0
  };

  try {
    const url = id ? `/api/inventory/${id}` : '/api/inventory';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to save item');

    showToast(id ? 'Item updated successfully' : 'New item added successfully');
    closeModal();
    fetchInventory();
    fetchStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Toast
let toastTimeout;
function showToast(msg, isError = false) {
  clearTimeout(toastTimeout);
  toastEl.textContent = msg;
  toastEl.style.borderLeft = isError ? '4px solid #ef4444' : '4px solid #10b981';
  toastEl.classList.remove('hidden');
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
