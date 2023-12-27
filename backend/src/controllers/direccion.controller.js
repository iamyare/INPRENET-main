const { getConnection } = require('../config/db');

async function getAllPais(req, res) {
    try {
      const query = `
        SELECT * FROM pais
      `;
  
      const connection = await getConnection();
      const result = await connection.execute(query);
      await connection.close();
  
      if (result.rows.length === 0) {
        return res.json({ ok: false, error: 'No se encontró ningún afiliado.' });
      }
  
      const paises = result.rows.map((row) => {
        const obj = {};
        for (let i = 0; i < result.metaData.length; i++) {
          const columnName = result.metaData[i].name;
          obj[columnName] = row[i];
        }
        return obj;
      });
  
      res.json({ ok: true, paises });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los afiliados.' });
    }
  }

async function getAllCiudad(req, res) {
    try {
      const query = `
        SELECT * FROM ciudad
      `;
  
      const connection = await getConnection();
      const result = await connection.execute(query);
      await connection.close();
  
      if (result.rows.length === 0) {
        return res.json({ ok: false, error: 'No se encontró ningún afiliado.' });
      }
  
      const ciudades = result.rows.map((row) => {
        const obj = {};
        for (let i = 0; i < result.metaData.length; i++) {
          const columnName = result.metaData[i].name;
          obj[columnName] = row[i];
        }
        return obj;
      });
  
      res.json({ ok: true, ciudades });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los afiliados.' });
    }
  }

async function getAllProvincia(req, res) {
    try {
      const query = `
        SELECT * FROM provincia
      `;
  
      const connection = await getConnection();
      const result = await connection.execute(query);
      await connection.close();
  
      if (result.rows.length === 0) {
        return res.json({ ok: false, error: 'No se encontró ningún afiliado.' });
      }
  
      const provincias = result.rows.map((row) => {
        const obj = {};
        for (let i = 0; i < result.metaData.length; i++) {
          const columnName = result.metaData[i].name;
          obj[columnName] = row[i];
        }
        return obj;
      });
  
      res.json({ ok: true, provincias });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los afiliados.' });
    }
  }
  module.exports = { getAllPais, getAllCiudad, getAllProvincia}