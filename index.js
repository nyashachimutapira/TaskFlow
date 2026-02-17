require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`TaskFlow API listening on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
