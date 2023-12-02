// En esta implementacion no estamos teniendo en cuenta aspectos de seguridad
const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: 'geomidatabase', // 127.0.0.1 en local | geomidatabase en la red docker
     //port: 3002, // solo para testing en local 
     user:'admin', 
     password: 'test1234',
     database: 'database',
     waitForConnection: true,
     connectionLimit: 5
});


async function executeQuery(query, params = []) {
    console.log(pool)
    const connection = await pool.getConnection();
    try {
      return await connection.execute(query, params);
    } finally {
      connection.release();
    }
  }

async function getLocationsOfUser(userId){
    if ( ! await userIsAdded(userId) ) return []

    res = executeQuery(`SELECT L.id, L.latitud, L.longitud, DATE_FORMAT(L.fecha_localizacion, '%d/%m/%Y %H:%i:%s') AS fecha_localizacion FROM usuarios AS U INNER JOIN localizaciones AS L ON U.id = L.usuario_id WHERE U.id = ${userId};`)
    return res
}

async function addNewLocationToUser(userId, latitude, longitude){
    if ( ! await userIsAdded(userId) ) return

    executeQuery(`INSERT INTO localizaciones ( usuario_id, latitud, longitud) VALUES (${userId}, ${latitude}, ${longitude});`)
}


async function userIsAdded(userId){
    res = await executeQuery(`SELECT * FROM usuarios WHERE id = ${userId};`)
    return res.length > 0
}

async function addNewUser(userId, name, email){
    if ( await userIsAdded(userId) ) return

    executeQuery(`INSERT INTO usuarios (id, nombre, email) VALUES (${userId}, '${name}', '${email}');`)
}

module.exports.getLocationsOfUser = getLocationsOfUser
module.exports.addNewLocationToUser = addNewLocationToUser
module.exports.addNewUser = addNewUser