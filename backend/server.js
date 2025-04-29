const express = require('express');
const app = express();
const port = 3000;

// Sample data
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
];

// Enable JSON parsing
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`, req.body);
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
/*
// Handle CORS preflight
app.options('*', (req, res) => {
  console.log('Handling CORS preflight');
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.sendStatus(200);
});
*/
// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Serving /api/test');
  res.json({ message: 'Server is running' });
});

// Items endpoint
app.get('/api/items', (req, res) => {
  console.log('Serving /api/items');
  res.json(items);
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Serving /');
  res.send('Welcome to the Node.js API! Use /api/items to get the items.');
});

// Verify config endpoint
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

// Start HTTP server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});