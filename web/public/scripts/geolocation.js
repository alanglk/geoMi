document.querySelector("#find-me").addEventListener("click", geoFindMe);
const locals = document.getElementById('locals')

const table_elm = document.getElementById('table')
const table_btn = document.getElementById('table-btn')

const map_elm = document.getElementById('map')
const map_btn = document.getElementById('map-btn')


// ---- Función de start up ----
window.onload = () => {
  // Array con las coordenadas para graficarlas en el mapa. Actualmente el caption de cada
  // pin solo muestra la fecha. Para ver la dirección hay que usar la tabla
  const pins = new Array()
  
  table_btn.addEventListener("click", tableClick) 
  map_btn.addEventListener("click", mapClick)

  // Por defecto, se muestra la tabla
  tableClick()

  // Añadir el evento a los botones "Get address"
  for (let i = 0; i < locals.children.length; i++){
    const local = locals.children[i]
    
    const id      = local.children[0].innerText
    const lat     = local.children[1].innerText
    const lon     = local.children[2].innerText
    const date    = local.children[3].innerText
    const button  = local.children[4].children[0] 

    pins.push({id: id, lat: parseFloat(lat), lon: parseFloat(lon), date: date})

    button.addEventListener("click", (event) => {
      const button  = event.target
      const address = button.parentElement.children[1]

      button.style.display  = "none";
      address.style.display = "block";

      geocoding(lat, lon, address)
    })
  }

  // Cargar mapa
  loadMap(pins)
}


// ---- Funciones de DOM ----
function tableClick(){
  table_btn.classList.remove('btn-secondary')
  table_btn.classList.add('btn-primary')
  table_elm.style.display = "table"

  map_btn.classList.remove('btn-primary')
  map_btn.classList.add('btn-secondary')
  map_elm.style.visibility = "hidden"
}

function mapClick(){
  table_btn.classList.remove('btn-primary')
  table_btn.classList.add('btn-secondary')
  table_elm.style.display = "none"
  
  map_btn.classList.remove('btn-secondary')
  map_btn.classList.add('btn-primary')
  map_elm.style.visibility = "visible"
}

// ---- Funciones del mapa ----
function getCentering(pins){
  let sumLat = 0
  let sumLon = 0 
  pins.forEach(l => { sumLat += l.lat; sumLon += l.lon; })
  
  return [sumLat / pins.length, sumLon / pins.length]
}

function loadMap(pins){
  
  let map = L.map('map').setView(getCentering(pins), 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


  // Ponemos los markers
  pins.forEach(l => {
    L.marker([l.lat, l.lon]).addTo(map)
      .bindPopup(`ID ${l.id} <br> ${l.date}`)
      .openPopup();
  })
}


// ---- Funciones AJAX ----
function geoFindMe() {
  const status = document.getElementById('status')

  async function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        status.textContent = "";

        // Enviarlo al servidor -> AJAX POST
        console.log(`la: ${latitude} lo: ${longitude}`)
        const data = {latitude: latitude, longitude: longitude}

        let res = await sendData("/localize", data)
        
        console.log(res)
        status.textContent = res
  }
  
  function error() {
    status.textContent = "No hemos podido conseguir tu localizacion";
  }

  if (!navigator.geolocation) {
    status.textContent = "Tu navegador no soporta el modulo de geolocalizacion";
  } else {
    status.textContent = "Localizando...";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

async function geocoding(latitude, longitude, addressElement){
  addressElement.textContent = "Obteniendo la dirección de la ubicación..."
  
  const url = "/geocoding"
  const data = {latitude: latitude, longitude: longitude}
  
  let res = await sendData(url, data)
  console.log(res)
  addressElement.textContent = res
}

function sendData(url, data) {
  return new Promise( (resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const JSONdata = JSON.stringify(data)
    
    xhr.open("POST", url, true)
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // Procesar la respuesta del servidor
    xhr.onload = function() {
      if (200 <= xhr.status < 300)  resolve(xhr.responseText)           
      else if (xhr.status >= 300)   reject('Error en la respuesta: ' + xhr.status + " " + xhr.statusText)       
    };

  // En caso de que haya un error enviando la peticion
    xhr.onerror = function() {
        reject('Error de red al realizar la solicitud.')
    };

    // Enviar la localizacion
    xhr.send(JSONdata)

    })
}