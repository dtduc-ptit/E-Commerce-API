const express = require('express');
const db = require('./config/db');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});