const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('../config/db');



async function getCentrosTrabajo(req, res) {
  try {
    const query = `
      SELECT *
      FROM centro_trabajo
    `;

    const connection = await getConnection();
    const result = await connection.execute(query);
    await connection.close();

    if (result.rows.length === 0) {
      return res.json({ ok: false, error: 'No se encontró ningún Centro de trabajo.' });
    }

    const centroTrabajo = result.rows.map((row) => {
      const obj = {};
      for (let i = 0; i < result.metaData.length; i++) {
        const columnName = result.metaData[i].name;
        obj[columnName] = row[i];
      }
      return obj;
    });

    res.json({ ok: true, centroTrabajo });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los Centros de trabajo.' });
  }
}

async function crearCentroTrabajo(req, res) {
  try {
    const {
      ciudad_id_ciudad='C001',
      nombre,
      telefono_1,
      telefono_2,
      correo_1,
      correo_2,
      apoderado_legal,
      representante_legal,
      rtn,
      logo,
    } = req.body;


    // Crea un nuevo ID para el centro de trabajo
    const id = uuidv4();

    // Crea la consulta SQL INSERT
    const insertQuery = `
      INSERT INTO centro_trabajo (
        id_centro_trabajo,
        ciudad_id_ciudad,
        nombre,
        telefono_1,
        telefono_2,
        correo_1,
        correo_2,
        apoderado_legal,
        representante_legal,
        rtn,
        logo
      )
      VALUES (
        :id,
        :ciudad_id_ciudad,
        :nombre,
        :telefono_1,
        :telefono_2,
        :correo_1,
        :correo_2,
        :apoderado_legal,
        :representante_legal,
        :rtn,
        :logo
      )
    `;

    // Obtén una conexión a la base de datos
    const connection = await getConnection();

    // Ejecuta la consulta SQL INSERT
    const result = await connection.execute(insertQuery, {
      id,
      ciudad_id_ciudad,
      nombre,
      telefono_1,
      telefono_2,
      correo_1,
      correo_2,
      apoderado_legal,
      representante_legal,
      rtn,
      logo,
    });

    // Confirma la transacción
    await connection.commit();

    // Cierra la conexión
    await connection.close();

    // Devuelve un mensaje de éxito
    res.json({ message: 'Centro de trabajo creado correctamente' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error en el servidor al crear el centro de trabajo.' });
  }
}

async function buscarCentroTrabajoPorNombre(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Por favor, proporciona un nombre para la búsqueda.' });
    }
    const selectQuery = 'SELECT * FROM centro_trabajo WHERE nombre = :nombre';
    const connection = await getConnection();
    const result = await connection.execute(selectQuery, { nombre });
    await connection.close();
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún centro de trabajo con el nombre proporcionado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error en el servidor al buscar el centro de trabajo por nombre.' });
  }
}
  

  async function updateCentroTrabajo(req, res) {
    let connection;
    try {
      const { id } = req.params; // Obtén el parámetro de la URL
      const {
        nombre,
        nombre_1,
        telefono_1,
        telefono_2,
        correo_1,
        correo_2,
        telefono,
        apoderado_legal,
        representante_legal,
        rtn,
        logo,
      } = req.body;
  
      // Verifica si id es un UUIDv4 válido
      const isIdValid = uuidv4(id);
  
      if (!isIdValid) {
        return res.status(400).json({ error: 'El id_centro_trabajo no es un UUIDv4 válido.' });
      }
  
      connection = await getConnection();
  
      // Construye la parte dinámica de la consulta SQL
      const updateFields = [];
      const bindParams = {};
  
      if (ciudad_id_ciudad !== undefined) {
        updateFields.push('ciudad_id_ciudad = :ciudad_id_ciudad');
        bindParams.ciudad_id_ciudad = ciudad_id_ciudad;
      }
  
      if (nombre !== undefined) {
        updateFields.push('nombre = :nombre');
        bindParams.nombre = nombre;
      }
  
      if (nombre_1 !== undefined) {
        updateFields.push('nombre_1 = :nombre_1');
        bindParams.nombre_1 = nombre_1;
      }
  
      if (telefono_1 !== undefined) {
        updateFields.push('telefono_1 = :telefono_1');
        bindParams.telefono_1 = telefono_1;
      }
  
      if (telefono_2 !== undefined) {
        updateFields.push('telefono_2 = :telefono_2');
        bindParams.telefono_2 = telefono_2;
      }
  
      if (correo_1 !== undefined) {
        updateFields.push('correo_1 = :correo_1');
        bindParams.correo_1 = correo_1;
      }
  
      if (correo_2 !== undefined) {
        updateFields.push('correo_2 = :correo_2');
        bindParams.correo_2 = correo_2;
      }
  
      if (telefono !== undefined) {
        updateFields.push('telefono = :telefono');
        bindParams.telefono = telefono;
      }
  
      if (apoderado_legal !== undefined) {
        updateFields.push('apoderado_legal = :apoderado_legal');
        bindParams.apoderado_legal = apoderado_legal;
      }
  
      if (representante_legal !== undefined) {
        updateFields.push('representante_legal = :representante_legal');
        bindParams.representante_legal = representante_legal;
      }
  
      if (rtn !== undefined) {
        updateFields.push('rtn = :rtn');
        bindParams.rtn = rtn;
      }
  
      if (logo !== undefined) {
        updateFields.push('logo = :logo');
        bindParams.logo = logo;
      }
  
      // Verifica si se proporcionaron campos para actualizar
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
      }
  
      // Construye y ejecuta la consulta SQL
      const updateQuery = `UPDATE centro_trabajo SET ${updateFields.join(', ')} WHERE id_centro_trabajo = :id`;
      const result = await connection.execute(updateQuery, { ...bindParams, id });
      await connection.commit();
  
      // Verifica si se actualizó algún registro
      if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'No se encontró el centro de trabajo con el ID proporcionado.' });
      }
  
      res.json({ message: 'Centro de trabajo actualizado correctamente' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Error en el servidor al intentar actualizar el centro de trabajo.' });
    } finally {
      // Asegúrate de cerrar la conexión en caso de cualquier error
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error('Error al cerrar la conexión:', closeError.message);
        }
      }
    }
  }
  

  async function getCentroTrabajoById(req, res) {
    try {
      const { id } = req.params;
      const connection = await getConnection();
  
      const result = await connection.execute('SELECT * FROM centro_trabajo WHERE id_centro_trabajo = :id', [id]);
  
      await connection.close();
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Centro de trabajo no encontrado' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  

  module.exports = { getCentrosTrabajo, getCentroTrabajoById, updateCentroTrabajo, crearCentroTrabajo, buscarCentroTrabajoPorNombre };