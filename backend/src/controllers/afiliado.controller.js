const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('../config/db');


async function getAllAfiliado(req, res) {
    try {
      const connection = await getConnection();
      const result = await connection.execute('SELECT * FROM afiliado');
      await connection.close();
      res.json(result.rows);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Error en el servidor al obtener los centros de trabajo.' });
    }
  }

  module.exports = { getAllAfiliado };
