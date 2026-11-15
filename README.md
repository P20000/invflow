# 📦 InvFlow - Inventory Management System

A fast, lightweight, and modern inventory management application built with **Node.js** and **Express**, paired with a reactive dashboard frontend and designed from the ground up for **Jenkins CI/CD** automation.

---

## ✨ Features

- **Dashboard & REST API**: Real-time overview of inventory metrics, total valuation, low-stock alerts, and SKU status.
- **Full Inventory Operations**:
  - Add, edit, and delete products.
  - Increment/decrement stock with safety checks against negative inventory.
  - Search by name, SKU, or category.
  - Filter for low-stock items.
- **CI/CD Ready**:
  - Built-in test suite powered by Node.js native test runner (`node:test`) and Supertest.
  - `Jenkinsfile` for automated build, test, and Docker container packaging.
  - Production-ready `Dockerfile` and `docker-compose.yml`.

---

## 🚀 Quick Start

### 1. Run Locally

```bash
# Install dependencies
npm install

# Run the test suite
npm test

# Start the application
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run with Docker

```bash
# Build Docker image
docker build -t invflow:latest .

# Run the container
docker run -p 3000:3000 --name invflow invflow:latest
```

---

## 🧪 Testing

The repository uses Node's native test runner to test endpoints without external test framework overhead:

```bash
npm test
```

Test coverage includes:
- `GET /health` - Health check verification
- `GET /api/inventory` - Seeded list and query filtering
- `GET /api/inventory/stats` - Inventory valuation & category aggregation
- `POST /api/inventory` - Item creation & duplicate SKU prevention
- `PATCH /api/inventory/:id/stock` - Stock increment/decrement and negative floor constraint
- `PUT /api/inventory/:id` - Item update
- `DELETE /api/inventory/:id` - Deletion and not-found verification

---

## 🛠️ Jenkins CI/CD Setup

Jenkins LTS is installed and running in Docker:

- **Jenkins URL**: [http://localhost:8080](http://localhost:8080)
- **Initial Admin Password**:
  ```bash
  docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
  ```

### Setting Up a Pipeline Job for InvFlow

1. Navigate to **http://localhost:8080** and unlock Jenkins using the initial admin password.
2. Select **"Install suggested plugins"** and create your primary admin user.
3. Go to **Dashboard > New Item**:
   - Enter `invflow-pipeline`.
   - Select **Pipeline** and click **OK**.
4. In the Pipeline configuration:
   - Under **Pipeline Definition**, select **Pipeline script from SCM**.
   - Choose **Git**.
   - Set **Repository URL** to your repository: `https://github.com/P20000/invflow.git`.
   - Branch: `*/main`.
   - Script Path: `Jenkinsfile`.
5. Click **Save** and trigger **Build Now**!

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status |
| `GET` | `/api/inventory` | List items (supports `?search=`, `?category=`, `?lowStock=true`) |
| `GET` | `/api/inventory/stats` | Summary metrics (totals, counts, value, categories) |
| `GET` | `/api/inventory/:id` | Get details for an individual item |
| `POST` | `/api/inventory` | Create new item (`name`, `sku`, `price`, `quantity`, etc.) |
| `PUT` | `/api/inventory/:id` | Update item details |
| `PATCH` | `/api/inventory/:id/stock` | Adjust stock level (`{ "amount": 5 }` or `{ "amount": -2 }`) |
| `DELETE` | `/api/inventory/:id` | Remove item |

---

## 📄 License

MIT © [P20000](https://github.com/P20000)
