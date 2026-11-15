const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`📦 InvFlow - Inventory Management System`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ Health check at http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});
