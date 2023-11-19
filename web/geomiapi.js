const http = require('http')

const host = "api:8000" // 127.0.0.1 en local | api:8000 en la red docker


function makeRequest(url) {
    return new Promise( (resolve, reject) => {
        http.get(url, res => {

            if ( 200 > res.statusCode >= 300 )
                reject('Error en la respuesta: ' + res.statusCode + " " + res.statusMessage)

            res.on('data', data => resolve(data.toString()) ) // Solo vamos a recibir un chunck porque son muy pocos datos
            res.on('error', err => reject('Error recibiendo datos: ' + err.message) )

        })
    })
    
}


async function getGeocodingOfLocation(lat, lon){
    // http://localhost:3001/api/geocoding/?lat=43.388109&lon=-3.224371
    const uri = `http://${host}/api/geocoding/?lat=${lat}&lon=${lon}`
    const url = encodeURI(uri)
    let res = await makeRequest(url)
    
    console.log(res)

    return res
}


module.exports.getGeocodingOfLocation = getGeocodingOfLocation