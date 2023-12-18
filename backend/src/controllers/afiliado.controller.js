const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('../config/db');


async function getAllAfiliado(req, res) {
  try {
    const query = `
    SELECT * FROM afiliado INNER JOIN TIPO_IDENTIFICACION ON 
    AFILIADO.TIPO_IDENTIFICACION_ID = TIPO_IDENTIFICACION.ID_IDENTIFICACION
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
        const {datosGen,datosPuestTrab,datosBanc,datosRefPers,datosBenefic} = req.body; 
        
        const id_afiliado = uuidv4();
  
        // Validar los datos necesarios
        if (!datosGen.ciudadNacimiento || !datosGen.tipoIdent) {
            return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios.' });
        }
  
        // Primera inserción en la tabla afiliado
        const query1 = `
        INSERT INTO afiliado (
          id_afiliado,
          pais_id_pais,
          pais_id_pais2,
          tipo_identificacion_id,
          afiliado_id_afiliado,
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
        ) VALUES (
          '${id_afiliado}',
          ${datosGen.ciudadNacimiento},
          ${datosGen.ciudadDomicilio},
          ${datosGen.tipoIdent},
          '${id_afiliado}',
          '${datosGen.numeroIden}',
          '${datosGen.estadoCivil}',
          '${datosGen.cotizante}',
          '${datosGen.primerNombre}',
          '${datosGen.segundoNombre}',
          '${datosGen.tercerNombre}',
          '${datosGen.primerApellido}',
          '${datosGen.segundoApellido}',
          TO_DATE('${datosGen.fechaNacimiento}', 'DD/MM/YYYY'),
          '${datosGen.Sexo}',
          ${datosGen.cantidadDependientes},
          ${datosGen.cantidadHijos},
          '${datosGen.profesion}',
          '${datosGen.representacion}',
          '${datosGen.telefono1}',
          '${datosGen.telefono2}',
          '${datosGen.correo1}',
          '${datosGen.correo2}',
          '${datosGen.archIdent}',
          '${datosGen.direccionDetallada}',
          '${datosGen.estado}'
        )
      `;
      console.log(query1);
        await connection.execute(query1);
        // Datos de perf_afil_cent_trab
  
        // Segunda inserción en la tabla perf_afil_cent_trab
        const id_perf_afil_cent_trab = uuidv4();
        const query2 = `
        INSERT INTO perf_afil_cent_trab (
            id_perf_afil_cent_trab,
            centro_trabajo_id,
            afiliado_id_afiliado,
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
          ) VALUES (
            '${id_perf_afil_cent_trab}',
            ${datosPuestTrab.centroTrabajo},
            '${id_afiliado}',
            '${datosPuestTrab.colegioMagisterial}',
            '${datosPuestTrab.numeroCarnet}',
            '${datosPuestTrab.cargo}',
            '${datosPuestTrab.sectorEconomico}',
            '${datosPuestTrab.actividadEconomica}',
            '${datosPuestTrab.claseCliente}',
            TO_DATE('${datosPuestTrab.fechaIngreso}', 'DD/MM/YYYY'),
            TO_DATE('${datosPuestTrab.fechaPago}', 'DD/MM/YYYY'),
            '${datosPuestTrab.sector}',
            '${datosPuestTrab.numeroAcuerdo}',
            ${datosPuestTrab.salarioNeto}
          )
        `;
        console.log(query2);
        await connection.execute(query2);
        // Tercera inserción en la tabla afiliados_por_banco

      const id_af_por_banco = uuidv4();
      
      const query3 = `
      INSERT INTO afiliados_por_banco (
        id_af_por_banco,
        afiliado_id_afiliado,
        banco_id_banco,
        num_cuenta
      ) VALUES (
        '${id_af_por_banco}',
        '${id_afiliado}',
        ${datosBanc.nombreBanco},
        '${datosBanc.numeroCuenta}'
      )
      `;
      console.log(query3);
      await connection.execute(query3);
  
      //Insercion a la tabla de referencias personales
      const referenciasPersonales = datosRefPers;
  
        if (referenciasPersonales && referenciasPersonales.length > 0) {
            for (const ref of referenciasPersonales) {
                const id_ref_personal = uuidv4();
                const queryReferencias = `
                INSERT INTO referencia_personal (
                    id_ref_personal,
                    afiliado_id_afiliado,
                    nombre,
                    direccion,
                    parentesco,
                    telefono_domicilio,
                    telefono_trabajo,
                    telefono_celular
                  ) VALUES (
                    '${id_ref_personal}',
                    '${id_afiliado}',
                    '${ref.nombreRefPers}',
                    '${ref.direccion}',
                    '${ref.Parentesco}',
                    '${ref.telefonoDom}',
                    '${ref.telefonoTrab}',
                    '${ref.telefonoPers}'
                  )`;
                  console.log(queryReferencias);
                await connection.execute(queryReferencias);
            }
        }
  
        //Insercion para los datos de los beneficiarios
  
        const beneficiario = datosBenefic;
        if (beneficiario && beneficiario.length > 0) {
          for (const ref of beneficiario) {
                const id_afiliadoB = uuidv4();
                const queryBeneficiarios = `
                INSERT INTO afiliado (
                    id_afiliado,
                    pais_id_pais,
                    pais_id_pais2,
                    tipo_identificacion_id,
                    afiliado_id_afiliado,
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
                  ) VALUES (
                    '${id_afiliadoB}',
                    ${ref.benfGroup.ciudadNacimiento},
                    ${ref.benfGroup.ciudadDomicilio},
                    ${ref.benfGroup.tipoIdent},
                    '${id_afiliado}',
                    '${ref.benfGroup.numeroIden}',
                    '${ref.benfGroup.estadoCivil}',
                    '${ref.benfGroup.cotizante}',
                    '${ref.benfGroup.primerNombre}',
                    '${ref.benfGroup.segundoNombre}',
                    '${ref.benfGroup.tercerNombre}',
                    '${ref.benfGroup.primerApellido}',
                    '${ref.benfGroup.segundoApellido}',
                    TO_DATE('${ref.benfGroup.fechaNacimiento}', 'DD/MM/YYYY'),
                    '${ref.benfGroup.Sexo}',
                    ${ref.benfGroup.cantidadDependientes},
                    ${ref.benfGroup.cantidadHijos},
                    '${ref.benfGroup.profesion}',
                    '${ref.benfGroup.representacion}',
                    '${ref.benfGroup.telefono1}',
                    '${ref.benfGroup.telefono2}',
                    '${ref.benfGroup.correo1}',
                    '${ref.benfGroup.correo2}',
                    '${ref.benfGroup.archIdent}',
                    '${ref.benfGroup.direccionDetallada}',
                    '${ref.benfGroup.estado}'
                  )
                `;
                console.log(queryBeneficiarios);
                await connection.execute(queryBeneficiarios);
                //Bancos de los beneficiarios
                const id_af_por_bancoB = uuidv4();
                  const queryAfiliadosPorBanco = `
                  INSERT INTO afiliados_por_banco (
                    id_af_por_banco,
                    afiliado_id_afiliado,
                    banco_id_banco,
                    num_cuenta
                  ) VALUES (
                    '${id_af_por_bancoB}',
                    '${id_afiliadoB}',
                    ${ref.DatosBac.nombreBanco},
                    '${ref.DatosBac.numeroCuenta}'
                  )
                  `;
                  console.log(queryAfiliadosPorBanco);
                  await connection.execute(queryAfiliadosPorBanco);
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