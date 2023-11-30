const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('../config/db');

async function getAllEmpresas(req, res) {
  try {
    const connection = await getConnection();
    const result = await connection.execute('SELECT * FROM empresa');
    await connection.close();
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function getEmpresaById(req, res) {
  const id = req.params.id;

  try {
    const connection = await getConnection();
    const result = await connection.execute('SELECT * FROM empresa WHERE id = :id', [id]);
    await connection.close();

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Elemento no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function createEmpresa(req, res) {
    const { nombre, telefono, RTN, representante_legal, apoderado_legal, correo, logo } = req.body;

    if (!nombre || !telefono || !RTN || !correo || !representante_legal || !apoderado_legal || !logo) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const id = uuidv4();

        await connection.execute(
            'INSERT INTO empresa (id, nombre, telefono, RTN, representante_legal, apoderado_legal, correo, logo) VALUES (:id, :nombre, :telefono, :RTN, :representante_legal, :apoderado_legal, :correo, :logo)',
            [id, nombre, telefono, RTN, representante_legal, apoderado_legal, correo, logo],
            { autoCommit: true }
        );

        await connection.close();
        res.status(200).json({ message: 'Empresa creada exitosamente', id });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}


  async function updateEmpresa(req, res) {
    const id = req.params.id;
    const { nombre, telefono, RTN, representante_legal, apoderado_legal, correo, logo } = req.body;
  
    try {
      const connection = await getConnection();
  
      // Construye dinámicamente la parte SET de la consulta SQL
      const updateValues = [];
      const updateFields = ['nombre', 'telefono', 'RTN', 'representante_legal', 'apoderado_legal', 'correo', 'logo'];
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateValues.push(`${field} = :${field}`);
        }
      });
  
      // Comprueba si hay algún campo para actualizar
      if (updateValues.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }
  
      const updateQuery = `UPDATE empresa SET ${updateValues.join(', ')} WHERE id = :id`;
  
      // Se Construye dinámicamente el array de valores para la consulta SQL
      const updateParams = {};
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateParams[field] = req.body[field];
        }
      });
      updateParams.id = id;
  
      await connection.execute(updateQuery, updateParams, { autoCommit: true });
  
      await connection.close();
      res.json({ message: 'Elemento actualizado exitosamente' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
async function deleteEmpresa(req, res) {
  const id = req.params.id;

  try {
    const connection = await getConnection();

    const result = await connection.execute('SELECT * FROM empresa WHERE id = :id', [id]);
    const empresaEliminada = result.rows[0];

    await connection.execute('DELETE FROM empresa WHERE id = :id', [id], { autoCommit: true });

    await connection.close();

    if (!empresaEliminada) {
      res.status(404).json({ error: 'Empresa no encontrada' });
    } else {
      res.json({ message: 'Empresa eliminada exitosamente', empresaEliminada });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = { getAllEmpresas, getEmpresaById, createEmpresa, updateEmpresa, deleteEmpresa };