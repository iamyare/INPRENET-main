
async function createAfiliado(req, res) {
    const connection = await getConnection();

    try {
        const id_afiliado = uuidv4();
        await insertAfiliado(connection, req.body, id_afiliado);
        await insertPerfilAfiliadoCentroTrabajo(connection, req.body, id_afiliado);
        await insertAfiliadosPorBanco(connection, req.body, id_afiliado);
        await insertReferenciasPersonales(connection, req.body.referenciasPersonales, id_afiliado);
        await insertBeneficiarios(connection, req.body.beneficiario, id_afiliado);

        await connection.commit();
        res.json({ ok: true, mensaje: 'Afiliado y detalles de centro de trabajo creados exitosamente.' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ ok: false, error: 'Error al crear el afiliado y los detalles del centro de trabajo.' });
    } finally {
        await connection.close();
    }
}

async function insertAfiliado(connection, body, id_afiliado) {
    // Validar datos necesarios
    if (!body.pais_id_pais || !body.tipo_identificacion_id) {
        throw new Error('Faltan datos obligatorios.');
    }

    // Preparar consulta SQL para insertar afiliado
    const query = `
        INSERT INTO afiliado 
        (id_afiliado, pais_id_pais, pais_id_pais2, tipo_identificacion_id, afiliado_id_afiliado, primer_nombre, segundo_nombre, tercer_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, cantidad_dependientes, cantidad_hijos, profesion, representacion, telefono_1, telefono_2, correo_1, correo_2, archivo_identificacion, direccion_residencia, estado)
        VALUES 
        (:id_afiliado, :pais_id_pais, :pais_id_pais2, :tipo_identificacion_id, :id_afiliado, :primer_nombre, :segundo_nombre, :tercer_nombre, :primer_apellido, :segundo_apellido, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'), :sexo, :cantidad_dependientes, :cantidad_hijos, :profesion, :representacion, :telefono_1, :telefono_2, :correo_1, :correo_2, :archivo_identificacion, :direccion_residencia, :estado)
    `;

    // Preparar los valores para la consulta
    const values = {
        id_afiliado,
        pais_id_pais: body.pais_id_pais,
        pais_id_pais2: body.pais_id_pais2,
        tipo_identificacion_id: body.tipo_identificacion_id,
        primer_nombre: body.primer_nombre,
        segundo_nombre: body.segundo_nombre,
        tercer_nombre: body.tercer_nombre,
        primer_apellido: body.primer_apellido,
        segundo_apellido: body.segundo_apellido,
        fecha_nacimiento: body.fecha_nacimiento,
        sexo: body.sexo,
        cantidad_dependientes: body.cantidad_dependientes,
        cantidad_hijos: body.cantidad_hijos,
        profesion: body.profesion,
        representacion: body.representacion,
        telefono_1: body.telefono_1,
        telefono_2: body.telefono_2,
        correo_1: body.correo_1,
        correo_2: body.correo_2,
        archivo_identificacion: body.archivo_identificacion,
        direccion_residencia: body.direccion_residencia,
        estado: body.estado
    };

    // Ejecutar la consulta
    await connection.execute(query, values);
}

async function insertPerfilAfiliadoCentroTrabajo(connection, body, id_afiliado) {
    // Generar un identificador único para el perfil del afiliado en el centro de trabajo
    const id_perf_afil_cent_trab = uuidv4();

    // Preparar la consulta SQL para insertar en la tabla perf_afil_cent_trab
    const query = `
        INSERT INTO perf_afil_cent_trab 
        (id_perf_afil_cent_trab, centro_trabajo_id, afiliado_id_afiliado, colegio_magisterial, numero_carnet, cargo, sector_economico, actividad_economica, clase_cliente, fecha_ingreso, fecha_pago, sector, numero_acuerdo, salario_neto)
        VALUES 
        (:id_perf_afil_cent_trab, :centro_trabajo_id, :id_afiliado, :colegio_magisterial, :numero_carnet, :cargo, :sector_economico, :actividad_economica, :clase_cliente, TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'), TO_DATE(:fecha_pago, 'YYYY-MM-DD'), :sector, :numero_acuerdo, :salario_neto)
    `;

    // Preparar los valores para la consulta
    const values = {
        id_perf_afil_cent_trab,
        centro_trabajo_id: body.centro_trabajo_id,
        id_afiliado,
        colegio_magisterial: body.colegio_magisterial,
        numero_carnet: body.numero_carnet,
        cargo: body.cargo,
        sector_economico: body.sector_economico,
        actividad_economica: body.actividad_economica,
        clase_cliente: body.clase_cliente,
        fecha_ingreso: body.fecha_ingreso,
        fecha_pago: body.fecha_pago,
        sector: body.sector,
        numero_acuerdo: body.numero_acuerdo,
        salario_neto: body.salario_neto
    };

    // Ejecutar la consulta
    await connection.execute(query, values);
}

async function insertAfiliadosPorBanco(connection, body, id_afiliado) {
    // Generar un identificador único para la relación afiliado-banco
    const id_af_por_banco = uuidv4();

    // Preparar la consulta SQL para insertar en la tabla afiliados_por_banco
    const query = `
        INSERT INTO afiliados_por_banco 
        (id_af_por_banco, afiliado_id_afiliado, banco_id_banco, num_cuenta)
        VALUES 
        (:id_af_por_banco, :id_afiliado, :banco_id_banco, :num_cuenta)
    `;

    // Preparar los valores para la consulta
    const values = {
        id_af_por_banco,
        id_afiliado,
        banco_id_banco: body.banco_id_banco,
        num_cuenta: body.num_cuenta
    };

    // Ejecutar la consulta
    await connection.execute(query, values);
}

async function insertReferenciasPersonales(connection, referenciasPersonales, id_afiliado) {
    if (!referenciasPersonales || referenciasPersonales.length === 0) {
        return; // No hay referencias personales para procesar
    }

    for (const ref of referenciasPersonales) {
        // Generar un identificador único para cada referencia personal
        const id_ref_personal = uuidv4();

        // Preparar la consulta SQL para insertar en la tabla referencia_personal
        const query = `
            INSERT INTO referencia_personal 
            (id_ref_personal, afiliado_id_afiliado, nombre, direccion, parentesco, telefono_domicilio, telefono_trabajo, telefono_celular)
            VALUES 
            (:id_ref_personal, :id_afiliado, :nombre, :direccion, :parentesco, :telefono_domicilio, :telefono_trabajo, :telefono_celular)
        `;

        // Preparar los valores para la consulta
        const values = {
            id_ref_personal,
            id_afiliado,
            nombre: ref.nombre,
            direccion: ref.direccion,
            parentesco: ref.parentesco,
            telefono_domicilio: ref.telefono_domicilio,
            telefono_trabajo: ref.telefono_trabajo,
            telefono_celular: ref.telefono_celular
        };

        // Ejecutar la consulta
        await connection.execute(query, values);
    }
}

async function insertBeneficiarios(connection, beneficiarios, id_afiliado_principal) {
    if (!beneficiarios || beneficiarios.length === 0) {
        return; // No hay beneficiarios para procesar
    }

    for (const beneficiario of beneficiarios) {
        // Generar un identificador único para cada beneficiario
        const id_afiliadoB = uuidv4();
        const id_af_por_bancoB = uuidv4();

        // Insertar datos del beneficiario en la tabla afiliado
        const queryAfiliado = `
            INSERT INTO afiliado 
            (id_afiliado, pais_id_pais, pais_id_pais2, tipo_identificacion_id, afiliado_id_afiliado, primer_nombre, segundo_nombre, tercer_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, cantidad_dependientes, cantidad_hijos, profesion, representacion, telefono_1, telefono_2, correo_1, correo_2, archivo_identificacion, direccion_residencia, estado)
            VALUES 
            (:id_afiliadoB, :pais_id_pais, :pais_id_pais2, :tipo_identificacion_id, :id_afiliado_principal, :primer_nombre, :segundo_nombre, :tercer_nombre, :primer_apellido, :segundo_apellido, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'), :sexo, :cantidad_dependientes, :cantidad_hijos, :profesion, :representacion, :telefono_1, :telefono_2, :correo_1, :correo_2, :archivo_identificacion, :direccion_residencia, :estado)
        `;

        await connection.execute(queryAfiliado, {
            id_afiliadoB,
            ...beneficiario // Asegúrate de que los campos coincidan con los nombres de las columnas de la tabla
        });

        // Si el beneficiario tiene detalles bancarios, insertarlos en la tabla afiliados_por_banco
        if (beneficiario.banco_id_banco && beneficiario.num_cuenta) {
            const queryAfiliadosPorBanco = `
                INSERT INTO afiliados_por_banco 
                (id_af_por_banco, afiliado_id_afiliado, banco_id_banco, num_cuenta)
                VALUES 
                (:id_af_por_bancoB, :id_afiliadoB, :banco_id_banco, :num_cuenta)
            `;

            await connection.execute(queryAfiliadosPorBanco, {
                id_af_por_bancoB,
                id_afiliadoB,
                banco_id_banco: beneficiario.banco_id_banco,
                num_cuenta: beneficiario.num_cuenta
            });
        }
    }
}