const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const routes = require('./src/routes/index.routes');

app.use(express.json());
app.use(routes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo esta mal');
  });

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app