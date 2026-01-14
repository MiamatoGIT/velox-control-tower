import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import reportRoutes from './routes/reportRoutes';

const app = express();
const PORT = 3000;
const ROOT_DIR = process.cwd();

// -- MIDDLEWARE --
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(ROOT_DIR, 'public')));

// -- ROUTES --
// Any request to /submit goes to our new report routes
app.use('/submit', reportRoutes);

app.get('/', (req, res) => {
  res.send('Velox Control Tower V2: MODULAR ARCHITECTURE ONLINE');
});

// -- START --
app.listen(PORT, () => {
  console.log(`🚀 Velox Systems Active on http://localhost:${PORT}`);
  console.log(`📂 ACC Sync Folder: ${path.join(ROOT_DIR, 'ACC_Sync')}`);
});