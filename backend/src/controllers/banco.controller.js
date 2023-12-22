const { getConnection } = require('../config/db');

async function getAllBancos(req, res) {
    try {
      const query = `
        SELECT * FROM banco
      `;
  
      const connection = await getConnection();
      const result = await connection.execute(query);
      await connection.close();
  
      if (result.rows.length === 0) {
        return res.json({ ok: false, error: 'No se encontró ningún afiliado.' });
      }
  
      const bancos = result.rows.map((row) => {
        const obj = {};
        for (let i = 0; i < result.metaData.length; i++) {
          const columnName = result.metaData[i].name;
          obj[columnName] = row[i];
        }
        return obj;
      });
  
      res.json({ ok: true, bancos });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los afiliados.' });
    }
  }
  module.exports = { getAllBancos }