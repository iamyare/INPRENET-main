const { v4: uuidv4 } = require('uuid');
const oracledb = require('oracledb');
const { getToken, getTokenData } = require('../config/jwt.config');
const { getTemplate, sendEmail } = require('../config/mail.config');
const path = require('path');
const bcrypt = require('bcrypt');

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
            'ADMINISTRADOR': 1,
            'OFICIAL DE OPERACION': 2,
            'CONTADOR': 3,
            'AUXILIAR': 4
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
            INSERT INTO usuario (id_usuario,nombre,correo,rol_id_rol,fk_id_ident)
            VALUES ('${id_usuario}', '${nombre}', '${correo}', ${rol_id_rol}, ${fk_id_ident})
        `;

        const a = await connection.execute(insertUserQuery);

        
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



const confirmAndUpdateSecurityInfo = async (req, res) => {
    const saltRounds = 10; // Definir el número de salt rounds para bcrypt
    let connection;

    try {
        
        // Obtener datos del cuerpo de la solicitud
        const {token, contrasena, pregunta_de_usuario_1, respuesta_de_usuario_1, pregunta_de_usuario_2, respuesta_de_usuario_2, pregunta_de_usuario_3, respuesta_de_usuario_3 } = req.body;

        // Verificar que la contraseña no sea null o undefined
        if (!contrasena) {
            return res.status(400).json({
                success: false,
                msg: 'La contraseña es requerida'
            });
        }

        // Verificar la data del token
        const data = await getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
                msg: 'Error al obtener data del token'
            });
        }

        const { correo, id_usuario } = data.data;

        // Verificar existencia del usuario en la base de datos
        connection = await getConnection();
        const userResult = await connection.execute(
            'SELECT * FROM Usuario WHERE correo = :correo AND id_usuario = :id_usuario',
            [correo, id_usuario],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const user = userResult.rows[0] || null;

        if (user === null) {
            return res.json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        // Actualizar estado del usuario
        const updateStateQuery = 'UPDATE Usuario SET estado = :estado WHERE correo = :correo AND id_usuario = :id_usuario';
        await connection.execute(updateStateQuery, ['ACTIVO', correo, id_usuario], { autoCommit: true });

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // Actualizar la información de seguridad del usuario
        const updateSecurityQuery = `
            UPDATE Usuario 
            SET 
                contrasena = :hashedPassword,
                pregunta_de_usuario_1 = :pregunta_de_usuario_1, 
                respuesta_de_usuario_1 = :respuesta_de_usuario_1, 
                pregunta_de_usuario_2 = :pregunta_de_usuario_2, 
                respuesta_de_usuario_2 = :respuesta_de_usuario_2, 
                pregunta_de_usuario_3 = :pregunta_de_usuario_3, 
                respuesta_de_usuario_3 = :respuesta_de_usuario_3 
            WHERE id_usuario = :id_usuario
        `;

        await connection.execute(updateSecurityQuery, {
            hashedPassword,
            pregunta_de_usuario_1,
            respuesta_de_usuario_1,
            pregunta_de_usuario_2,
            respuesta_de_usuario_2,
            pregunta_de_usuario_3,
            respuesta_de_usuario_3,
            id_usuario
        }, { autoCommit: true });

        // Enviar respuesta de éxito
        res.json({
            success: true,
            msg: 'Usuario confirmado y seguridad actualizada'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error al confirmar usuario y actualizar información de seguridad'
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
    confirmAndUpdateSecurityInfo,
    updateData
}