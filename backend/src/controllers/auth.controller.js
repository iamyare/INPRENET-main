const { v4: uuidv4 } = require('uuid');
const oracledb = require('oracledb');
const { getToken, getTokenData } = require('../config/jwt.config');
const { getTemplate, sendEmail } = require('../config/mail.config');
const path = require('path');

const { getConnection } = require('../config/db');

const signUp = async (req, res) => {
    let connection;

    try {
        // Obtener la data del usuario: nombre, correo
        const { nombre, correo } = req.body;

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

        // Generar el código
        const id = uuidv4();
        const rol_id = 1;

        // Crear un nuevo usuario
        const insertUserQuery = `
            INSERT INTO Usuario (id, nombre, correo, rol_id)
            VALUES (:id, :nombre, :correo, :rol_id)
        `;
        const userParams = {id, nombre, correo, rol_id };
        await connection.execute(insertUserQuery, userParams, { autoCommit: true });

        // Generar token
        const token = getToken({ correo, id });

        // Obtener un template
        const template = getTemplate(nombre, token);

        // Enviar el email
        await sendEmail(correo, 'Este es un email de prueba', template);

        // Devolver el token en la respuesta
        res.json({
            success: true,
            msg: 'Registrado correctamente',
            token: token // Añadir el token a la respuesta
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


        const { correo, id } = data.data;

        // Verificar existencia del usuario en la base de datos Oracle
        connection = await getConnection();
        const result = await connection.execute(
            'SELECT * FROM Usuario WHERE correo = :correo AND id = :id',
            [correo, id],
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
        const updateQuery = 'UPDATE Usuario SET estado = :estado WHERE correo = :correo AND id = :id';
        await connection.execute(updateQuery, ['VERIFICADO', correo, id], { autoCommit: true });

        // Redireccionar a la confirmación
       return res.redirect('http://127.0.0.7:5500/backend/public/confirm.html');
    } catch (error) {
        console.log(error);
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