const { v4: uuidv4 } = require('uuid');
const oracledb = require('oracledb');
const { getToken, getTokenData } = require('../config/jwt.config');
const { getTemplate, sendEmail } = require('../config/mail.config');
const path = require('path');

const { getConnection } = require('../config/db');

const signUp = async (req, res) => {
    let connection;

    try {
        // Obtener la data del usuario: nombre, correo, rol y tipo de identificación
        const { nombre, correo, nombreRol, tipoIdentificacion, numeroIdentificacion, archivoidentificacion } = req.body;

        // Verificar que el usuario no exista
        connection = await getConnection();
        const result = await connection.execute(
            'SELECT * FROM Usuario WHERE correo = :correo',
            [correo],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const existingUser = result.rows[0] || null;

        if (existingUser !== null) {
            return res.json({
                success: false,
                msg: 'Usuario ya existe'
            });
        }

        // Obtener el id de rol y tipo de identificación según los parámetros
        const rolIdMap = {
            'Administrador': 1,
            'Oficial de Operacion': 2,
            'Contador': 3,
            'Auxiliar': 4
        };

        const tipoIdentificacionIdMap = {
            'CARNET RESIDENCIA': 1,
            'DNI': 2,
            'NUMERO LICENCIA': 3,
            'PASAPORTE': 4,
            'RTN': 5
        };

        const rol_id_rol = rolIdMap[nombreRol];
        const fk_id_ident = tipoIdentificacionIdMap[tipoIdentificacion];

        // Crear un nuevo usuario
        const id_usuario = uuidv4();
        const insertUserQuery = `
            INSERT INTO Usuario (id_usuario, nombre, correo, rol_id_rol, fk_id_ident)
            VALUES (:id_usuario, :nombre, :correo, :rol_id_rol, :fk_id_ident)
        `;

        const userParams = { id_usuario, nombre, correo, rol_id_rol, fk_id_ident };
        await connection.execute(insertUserQuery, userParams, { autoCommit: true });

        // Generar token
        const tokenData = { correo, id_usuario };
        const token = getToken(tokenData);

        // Obtener un template
        const template = getTemplate(nombre, token);

        // Enviar el email
        await sendEmail(correo, 'Este es un email de prueba', template);

        // Insertar datos en la tabla empleado
        const id_empleado = uuidv4();
        const numero_identificacion = numeroIdentificacion;
        const archivo_identificacion = archivoidentificacion;
        const usuario_id_usuario = id_usuario;

        const insertEmpleadoQuery = `
            INSERT INTO empleado (id_empleado, usuario_id_usuario, numero_identificacion, archivo_identificacion)
            VALUES (:id_empleado, :usuario_id_usuario, :numero_identificacion, :archivo_identificacion)
        `;

        const empleadoParams = {
            id_empleado,
            usuario_id_usuario,
            numero_identificacion,
            archivo_identificacion
        };

        await connection.execute(insertEmpleadoQuery, empleadoParams, { autoCommit: true });

        // Devolver el token en la respuesta
        res.json({
            success: true,
            msg: 'Registrado correctamente',
            token: token
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            msg: 'Error al registrar usuario'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing database connection:', error.message);
            }
        }
    }
};


const updateData = async(req, res) => {
    const filePath = path.join(__dirname, '../..', 'public', 'pruebaempleado.html');
    const { token } = req.params;
    
    res.sendFile(filePath);
}


const confirm = async (req, res) => {
    let connection;

    try {
        // Obtener el token
        const { token } = req.params;

        // Verificar la data
        const data = await getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
                msg: 'Error al obtener data'
            });
        }

        const { correo, id_usuario } = data.data;

        // Verificar existencia del usuario en la base de datos Oracle
        connection = await getConnection();
        const result = await connection.execute(
            'SELECT * FROM Usuario WHERE correo = :correo AND id_usuario = :id_usuario',
            [correo, id_usuario],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const user = result.rows[0] || null;

        if (user === null) {
            return res.json({
                success: false,
                msg: 'Usuario no existe'
            });
        }

        // Actualizar estado del usuario
        const updateQuery = 'UPDATE Usuario SET estado = :estado WHERE correo = :correo AND id_usuario = :id_usuario';
        await connection.execute(updateQuery, ['ACTIVO', correo, id_usuario], { autoCommit: true });

        // Redireccionar a la confirmación
        return res.redirect('http://127.0.0.7:5500/backend/public/confirm.html');  // Ajusta la URL según tu necesidad
    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            msg: 'Error al confirmar usuario'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing database connection:', error.message);
            }
        }
    }
};


module.exports = {
    signUp,
    confirm,
    updateData
}