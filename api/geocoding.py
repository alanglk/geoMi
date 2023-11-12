from os.path import join
import requests
import json

class geocoding():
    def __init__(self, file_credentials="credentials.json"):
        f = open(file_credentials)
        data = json.load(f)
        f.close()
        
        self.API_KEY = data['API_KEY']
        
        # URL base de la API de geocodificación de Google
        self.base_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

    def __procesar_respuesta(self, response):
        direccion = ""
        
        # Verifica si la solicitud fue exitosa
        if response.status_code == 200:
            data = response.json()

            # Verifica si se encontró una dirección
            if data['status'] == 'OK':
                # Obtiene la primera dirección encontrada
                direccion = data['results'][0]['formatted_address']
            else:
                direccion = f'No se encontraron resultados. Estado: {data["status"]}'
        else:
            direccion = f'Error en la solicitud. Código de estado: {response.status_code}'
        
        return direccion
    
    def obtener_direccion(self, latitud, longitud):
        # Parámetros de la solicitud
        params = {
            'latlng': f'{latitud},{longitud}',
            'key': self.API_KEY,
        }

        # Realiza la solicitud a la API de Google
        response = requests.get(self.base_url, params=params)
        return self.__procesar_respuesta(response)
        
# TEST
# Coordenadas que deseas convertir en una dirección
latitud = 37.7749
longitud = -122.4194

direccion = geocoding().obtener_direccion(latitud, longitud)
print(direccion)

