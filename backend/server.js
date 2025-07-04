
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

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
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/clio', clioRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
