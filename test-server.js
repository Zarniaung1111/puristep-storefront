import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(5000, '0.0.0.0', () => {
  console.log('Basic server working on port 5000');
  process.exit(0);
});
