const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('../config/db');


async function getAllAfiliado(req, res) {
  try {
    const query = `
      SELECT *
      FROM afiliado
    `;

    const connection = await getConnection();
    const result = await connection.execute(query);
    await connection.close();

    if (result.rows.length === 0) {
      return res.json({ ok: false, error: 'No se encontró ningún afiliado.' });
    }

    const afiliados = result.rows.map((row) => {
      const obj = {};
      for (let i = 0; i < result.metaData.length; i++) {
        const columnName = result.metaData[i].name;
        obj[columnName] = row[i];
      }
      return obj;
    });

    res.json({ ok: true, afiliados });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ ok: false, error: 'Error en el servidor al buscar los afiliados.' });
  }
}

async function createAfiliado(req, res) {
    const connection = await getConnection();
    try {
        // Datos de afiliado
        const {
            pais_id_pais,
            pais_id_pais2,
            tipo_identificacion_id,
            dni,
            estado_civil,
            tipo_cotizante,
            primer_nombre,
            segundo_nombre,
            tercer_nombre,
            primer_apellido,
            segundo_apellido,
            fecha_nacimiento,
            sexo,
            cantidad_dependientes,
            cantidad_hijos,
            profesion,
            representacion,
            telefono_1,
            telefono_2,
            correo_1,
            correo_2,
            archivo_identificacion,
            direccion_residencia,
            estado
        } = req.body;
  
        const id_afiliado = uuidv4();
  
        // Validar los datos necesarios
        if (!pais_id_pais || !tipo_identificacion_id) {
            return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios.' });
        }
  
        // Primera inserción en la tabla afiliado
        const query1 = `
            INSERT INTO afiliado (id_afiliado, pais_id_pais, pais_id_pais2, tipo_identificacion_id, afiliado_id_afiliado, dni, estado_civil, tipo_cotizante, primer_nombre, segundo_nombre, tercer_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, cantidad_dependientes, cantidad_hijos, profesion, representacion, telefono_1, telefono_2, correo_1, correo_2, archivo_identificacion, direccion_residencia, estado)
            VALUES (:id_afiliado, :pais_id_pais, :pais_id_pais2, :tipo_identificacion_id, :id_afiliado, :dni, :estado_civil ,:tipo_cotizante, :primer_nombre, :segundo_nombre, :tercer_nombre, :primer_apellido, :segundo_apellido, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'), :sexo, :cantidad_dependientes, :cantidad_hijos, :profesion, :representacion, :telefono_1, :telefono_2, :correo_1, :correo_2, :archivo_identificacion, :direccion_residencia, :estado)
        `;
        await connection.execute(query1, {
            id_afiliado,
            pais_id_pais,
            pais_id_pais2,
            tipo_identificacion_id,
            dni,
            estado_civil,
            tipo_cotizante,
            primer_nombre,
            segundo_nombre,
            tercer_nombre,
            primer_apellido,
            segundo_apellido,
            fecha_nacimiento,
            sexo,
            cantidad_dependientes,
            cantidad_hijos,
            profesion,
            representacion,
            telefono_1,
            telefono_2,
            correo_1,
            correo_2,
            archivo_identificacion,
            direccion_residencia,
            estado
        });
        // Datos de perf_afil_cent_trab
        const {
            centro_trabajo_id,
            colegio_magisterial,
            numero_carnet,
            cargo,
            sector_economico,
            actividad_economica,
            clase_cliente,
            fecha_ingreso,
            fecha_pago,
            sector,
            numero_acuerdo,
            salario_neto
        } = req.body;
  
        // Segunda inserción en la tabla perf_afil_cent_trab
        const id_perf_afil_cent_trab = uuidv4();
        const query2 = `
            INSERT INTO perf_afil_cent_trab (id_perf_afil_cent_trab, centro_trabajo_id, afiliado_id_afiliado, colegio_magisterial, numero_carnet, cargo, sector_economico, actividad_economica, clase_cliente, fecha_ingreso, fecha_pago, sector, numero_acuerdo, salario_neto)
            VALUES (:id_perf_afil_cent_trab, :centro_trabajo_id, :id_afiliado, :colegio_magisterial, :numero_carnet, :cargo, :sector_economico, :actividad_economica, :clase_cliente, TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'), TO_DATE(:fecha_pago, 'YYYY-MM-DD'), :sector, :numero_acuerdo, :salario_neto)
        `;
        await connection.execute(query2, {
            id_perf_afil_cent_trab,
            centro_trabajo_id,
            id_afiliado,
            colegio_magisterial,
            numero_carnet,
            cargo,
            sector_economico,
            actividad_economica,
            clase_cliente,
            fecha_ingreso,
            fecha_pago,
            sector,
            numero_acuerdo,
            salario_neto
        });
        // Tercera inserción en la tabla afiliados_por_banco
        const {
          banco_id_banco,
          num_cuenta
      } = req.body;
  
      const id_af_por_banco = uuidv4();
      
      const query3 = `
          INSERT INTO afiliados_por_banco (id_af_por_banco, afiliado_id_afiliado, banco_id_banco, num_cuenta)
          VALUES (:id_af_por_banco, :id_afiliado, :banco_id_banco, :num_cuenta)
      `;
      await connection.execute(query3, {
          id_af_por_banco,
          id_afiliado,
          banco_id_banco,
          num_cuenta
      });
  
      //Insercion a la tabla de referencias personales
      const referenciasPersonales = req.body.referenciasPersonales;
  
        if (referenciasPersonales && referenciasPersonales.length > 0) {
            for (const ref of referenciasPersonales) {
                const id_ref_personal = uuidv4();
                const queryReferencias = `
                    INSERT INTO referencia_personal (id_ref_personal, afiliado_id_afiliado, nombre, direccion, parentesco, telefono_domicilio, telefono_trabajo, telefono_celular)
                    VALUES (:id_ref_personal, :id_afiliado, :nombre, :direccion, :parentesco, :telefono_domicilio, :telefono_trabajo, :telefono_celular)
                `;
                await connection.execute(queryReferencias, {
                    id_ref_personal,
                    id_afiliado,
                    nombre: ref.nombre,
                    direccion: ref.direccion,
                    parentesco: ref.parentesco,
                    telefono_domicilio: ref.telefono_domicilio,
                    telefono_trabajo: ref.telefono_trabajo,
                    telefono_celular: ref.telefono_celular
                });
            }
        }
  
        //Insercion para los datos de los beneficiarios
  
        const beneficiario = req.body.beneficiario;
  
        if (beneficiario && beneficiario.length > 0) {
            for (const ref of beneficiario) {
                const id_afiliadoB = uuidv4();
                const queryReferencias = `
                INSERT INTO afiliado (id_afiliado, pais_id_pais, pais_id_pais2, tipo_identificacion_id, afiliado_id_afiliado, dni, estado_civil ,tipo_cotizante, primer_nombre, segundo_nombre, tercer_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, cantidad_dependientes, cantidad_hijos, profesion, representacion, telefono_1, telefono_2, correo_1, correo_2, archivo_identificacion, direccion_residencia, estado)
                VALUES (:id_afiliadoB, :pais_id_pais, :pais_id_pais2, :tipo_identificacion_id, :id_afiliado, :dni, :estado_civil ,:tipo_cotizante, :primer_nombre, :segundo_nombre, :tercer_nombre, :primer_apellido, :segundo_apellido, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'), :sexo, :cantidad_dependientes, :cantidad_hijos, :profesion, :representacion, :telefono_1, :telefono_2, :correo_1, :correo_2, :archivo_identificacion, :direccion_residencia, :estado)
                `;
                await connection.execute(queryReferencias, {
                    id_afiliadoB,
                    id_afiliado,
                    pais_id_pais: ref.pais_id_pais,
                    pais_id_pais2: ref.pais_id_pais2,
                    tipo_identificacion_id: ref.tipo_identificacion_id,
                    dni : ref.dni,
                    estado_civil : ref.estado_civil,
                    tipo_cotizante : ref.tipo_cotizante,
                    primer_nombre: ref.primer_nombre,
                    segundo_nombre: ref.segundo_nombre,
                    tercer_nombre: ref.tercer_nombre,
                    tercer_nombre: ref.tercer_nombre,
                    primer_apellido: ref.primer_apellido,
                    segundo_apellido: ref.segundo_apellido,
                    fecha_nacimiento: ref.fecha_nacimiento,
                    sexo: ref.sexo,
                    cantidad_dependientes: ref.cantidad_dependientes,
                    cantidad_hijos: ref.cantidad_hijos,
                    profesion: ref.profesion,
                    representacion: ref.representacion,
                    telefono_1: ref.telefono_1,
                    telefono_2: ref.telefono_2,
                    correo_1: ref.correo_1,
                    correo_2: ref.correo_2,
                    archivo_identificacion: ref.archivo_identificacion,
                    direccion_residencia: ref.direccion_residencia,
                    estado: ref.estado
                });
                //Bancos de los beneficiarios
                const id_af_por_bancoB = uuidv4();
                  const queryAfiliadosPorBanco = `
                      INSERT INTO afiliados_por_banco (id_af_por_banco, afiliado_id_afiliado, banco_id_banco, num_cuenta)
                      VALUES (:id_af_por_bancoB, :id_afiliadoB, :banco_id_banco, :num_cuenta)
                  `;
                  await connection.execute(queryAfiliadosPorBanco, {
                      id_af_por_bancoB,
                      id_afiliadoB,
                      banco_id_banco: ref.banco_id_banco,
                      num_cuenta: ref.num_cuenta
                  });
            }
        } 
        // Confirmar transacción
        await connection.commit();
  
        res.json({ ok: true, mensaje: 'Afiliado y detalles de centro de trabajo creados exitosamente.' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ ok: false, error: 'Error al crear el afiliado y los detalles del centro de trabajo.' });
    } finally {
        // Cerrar la conexión
        await connection.close();
    }
  }


  module.exports = { getAllAfiliado, createAfiliado };
