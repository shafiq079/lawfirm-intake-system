
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('cloudinary').v2;

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

const app = express();

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const intakeRoutes = require('./routes/intakeRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const voiceGatherRoutes = require('./routes/voiceGatherRoutes');
const clioRoutes = require('./routes/clioRoutes');

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/intakes', intakeRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/voice', voiceGatherRoutes);

// Temporary logging middleware for debugging upload route
app.use('/api/uploads', (req, res, next) => {
  console.log(`Request received for /api/uploads: ${req.method} ${req.url}`);
  next();
});

app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/clio', clioRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
