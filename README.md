<h1 align="center" style="border-bottom: none">
    <a href="http://localhost:3000" target="_blank"><img alt="GeoMi" src="/documentation/images/geoMi.png" style="width:50"></a><br>GeoMi
</h1>

<p align="center">Visit <a href="/documentation/" target="_blank">geomi.pdf</a> for the full documentation,
examples and guides.</p>

<div align="center">
    <!-- Etiquetas varias -->
</div>

# TODO LIST
Aspectos que hay que cambiar en la aplicación antes de la entrega:

1. Verificar que los contenedores están bien elegidos para la práctica

2. Carga de `database.slq` de forma automática. Está especificado más abajo.

3. Estudiar mejor las métricas que se mandan a __Prometheus__

4. Preparar los __Dashboards__ de Grafana desde el fichero de configuración

5. Hacer un deployment en __Kubernetes__ 

6. Añadir, por si acaso, un Login tradicional.

7. Subir las imágenes a __Docker Hub__


# GeoMi
GeoMi es una aplicación web desarrollada para la asignatura Administración de Sistemas del grado Ingeniería Informática de Gestión y Sistemas de Información de la UPV/EHU. El objetivo de este desarrollo es realizar una correcta configuración de servicios y contenedores Docker partiendo de una aplicación web compuesta por, al menos, tres contenedores:
- Un servidor web
- Una servidor de BBDD
- Un tercer contenedor de libre elección

## Descripción de la aplicación
GeoMi consiste en una aplicación en la que los usuarios son capaces de registrar sus posiciones por medio del servicio de locaclizacion del navegador para elaborar un histórico de geolocalizaciones. Los datos de las localizaciones se presentan de dos formas posibles:

- __Formato de tabla__

    Es el formato predefinido de los datos. Es un volcado de los datos del usuario en una tabla. Sin embargo, la seccioón de `Dirección` no está guardada en la base de datos si no que se hace una llamada al servicio Geocoding de la __API de Google__ para obtener una descripción con texto de las coordenadas.

    | ID | Latitud | Longitud |    Fecha   | Dirección |
    |----|---------|----------|------------|-----------|
    | 1  | ......  | ......   | 17/11/2023 | Calle.... |
    | 2  | ......  | ......   | 18/11/2023 | Calle.... |
    | 3  | ......  | ......   | 19/11/2023 | Calle.... |

- __Formato mapa__

    En este formato se muestra la información de las localizaciones del usuario mediante pines en un mapa. Cada pin tiene una pequeña descripción que indica la `fecha` de la localización y su `id`. Sin embargo, la opción de obtener la dirección en texto de la ubicación no está disponible en este modo.

    ![Mapa de Bilbao](/images/map-example.png) 

Sin embargo, para acceder a todos los datos y a las opciones de añadir nuevas localizaciones, es necesario registrarse e iniciar sesión en la aplicación. Por ello, se ha implementado un sistema de gestión de usuarios con las funciones básicas de _Login_ y _Logout_. Actualmente, solo está implementado el inicio de sesión por medio de __Google OAuth2__ por lo que, para poder tener acceso a la aplicación, es necesario disponer de una cuenta de __Google__.


### Arquitectura de la aplicación
TODO: Explicar contenedores, redes y comunicaciones entre contenedores. También hay que explicar aspectos básicos como la estructura de la base de datos o las comunicaciones con las APIs



## Instalación
Puedes iniciar la apliación con `docker compose`:

```
sudo docker compose up
```

Una vez se hayan descargado las imágenes y dependencias necesarias, se iniciarán los siguientes servicios:

1. [localhost:3000/](http://localhost:3000/) Entrada principal de la aplicación web

2. [localhost:3001/](http://localhost:3001/) Servicio de la API de GeoMi. Es el conector a la API de Geocoding de Google.

3. `localhost:3002/` Servicio de base de datos de MariaDB. Para establecer una conexión con la base de datos se puede utilizar el cliente de mariadb: 

    ```
    mariadb --host=localhost --port=3002 -u admin -ptest database
    ```

    Si es la primera vez que se inicia la base de datos y no hay datos previos, es necesario cargar la estructura de la base de datos desde el fichero `database.sql`.
    
    TODO: Añadir la carga de `database.sql` de forma automática. 

4. [localhost:3003/](http://localhost:3003/) Servicio web de Adminer. Es un portal web para la gestión de la base de datos de una forma gráfica.

5. [localhost:3004/](http://localhost:3004/) Servicio de Grafana. Es un portal que muestra los dashboards de rendimiento de la aplicación-

6. [localhost:3006/](http://localhost:3004/) Servicio de Prometheus. Servicio encargado de tomar y registrar todas las métricas que luego se grafican con Grafana.


# Aspectos que se han estudiado
- Nginx
- mysqld-exporter
- RabbitMQ