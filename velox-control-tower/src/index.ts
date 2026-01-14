import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Velox Control Tower: ONLINE');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});