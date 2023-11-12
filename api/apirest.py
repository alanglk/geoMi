from flask import Flask, request
import geocoding

app = Flask(__name__)
geo = geocoding.geocoding()

@app.route('/')
def index():
    return "Esta es la API de geoMi!"

# http://localhost/geocoding/api?lat=___&lon=___
@app.route('/api/geocoding/', methods=['GET'])
def api():
    print("API")
    args = request.args.to_dict()
    latitude    = args['lat']
    longitude   = args['lon']
    
    res = geo.obtener_direccion(latitude, longitude)
    
    return res, 200

if __name__ == '__main__':   
    app.run(host='0.0.0.0', debug=False)