const jwt = require('jsonwebtoken');

const getToken = (payload) => {
    return jwt.sign({
        data: payload
    }, process.env.KEY_TOKEN, { expiresIn: '50h' });
}

const getTokenData = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.KEY_TOKEN, (err, decoded) => {
            if (err) {
                console.log('Error al obtener data del token', err.message);
                reject(err); // Rechaza la promesa si hay un error
            } else {
                resolve(decoded); // Resuelve la promesa con los datos decodificados
            }
        });
    });
};

module.exports = {
    getToken,
    getTokenData
}