const express = require('express');
const cors = require('cors');
const ipc = require('node-ipc').default;
const app = express();
const port = 3000;

// Sample data
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
];

// in order to enable JSON parsing
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// API endpoints
app.get('/api/items', (req, res) => {
  console.log('Serving /api/items');
  res.json(items);
});

app.get('/', (req, res) => {
  console.log('Serving /');
  res.send('Welcome to the Node.js API! Use /api/items to get the items.');
});

app.post('/api/verify-config', (req, res) => {
  console.log('Processing /api/verify-config with config:', req.body);
  const config = req.body;
  const errors = [];

  // Validation rules
  if (!config.appID || !/^0[xX][0-9A-Fa-f]{1,4}$/.test(config.appID)) {
    errors.push('appID must be a hexadecimal value (e.g., 0x1000 or 0X1000)');
  }
  if (!config.macAddress || !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(config.macAddress)) {
    errors.push('macAddress must be in format XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX');
  }
  if (!config.GOid || !/^[A-Za-z0-9_]+$/.test(config.GOid)) {
    errors.push('GOid must be alphanumeric with underscores');
  }
  if (!config.interface || !/^[A-Za-z0-9]+$/.test(config.interface)) {
    errors.push('interface must be alphanumeric (e.g., eth0)');
  }
  if (!config.cbref || !/^[A-Za-z0-9_]+$/.test(config.cbref)) {
    errors.push('cbref must be alphanumeric with underscores');
  }
  if (!config.svid || !/^[A-Za-z0-9_]+$/.test(config.svid)) {
    errors.push('svid must be alphanumeric with underscores');
  }
  if (!config.scenariofile || !/^[A-Za-z0-9_]+\.[xX][mM][lL]$/.test(config.scenariofile)) {
    errors.push('scenariofile must be a valid XML filename (e.g., scenario.xml or SCENARIO.XML)');
  }

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ errors });
  }
  console.log('Config valid');
  res.json({ message: 'Configuration is valid' });
});

app.post('/api/start-simulation', (req, res) => {
  console.log('Processing /api/start-simulation with config:', req.body);
  const config = req.body;
  try {
    const socket = ipc.server.sockets[Object.keys(ipc.server.sockets)[0]];
    if (!socket) {
      throw new Error('No C application connected');
    }
    ipc.server.emit(socket, 'start_simulation', { config });
    res.json({ message: 'Simulation started' });
  } catch (error) {
    console.error('Simulation error:', error.message);
    res.status(500).json({ error: 'Failed to start simulation: ' + error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start HTTP server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Configure node-ipc server
ipc.config.id = 'sv_simulator';
ipc.config.retry = 1500;
ipc.config.silent = false;

ipc.serve(() => {
  console.log('node-ipc server started');
  ipc.server.on('connect', (socket) => {
    console.log('C application connected via IPC');
  });
  ipc.server.on('socket.disconnected', (socket, destroyedSocketID) => {
    console.log('C application disconnected');
  });
  ipc.server.on('message', (data, socket) => {
    console.log('Received from C app:', data);
  });
});

ipc.server.start();
