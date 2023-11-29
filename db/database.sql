SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Para habilitar la monitorización de la base de datos
--
-- CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'test1234';
-- GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'exporter'@'localhost';
-- GRANT SELECT ON performance_schema.* TO 'exporter'@'localhost';

--
-- Base de datos: `database`
--

-- --------------------------------------------------------
-- USE database

--
-- Creacion de las tablas de la base de datos
--
-- Se que es una mala practica poner un varchar como una clave primaria, pero
-- para este caso de uso es la opción más sencilla. De hacerlo bien, convendría
-- crear una tabla que relacione los ids de google (enteros de 21 digitos) con una
-- clave más pequeña. Sin embargo, al solo haber implementado el inicio de sesión con 
-- google OAuth2, no tiene mucho sentido hacer esta relación.

CREATE TABLE usuarios (
    id VARCHAR(30) PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE localizaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(30),
    latitud DECIMAL(9,6) NOT NULL,
    longitud DECIMAL(9,6) NOT NULL,
    fecha_localizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos de ejemplo
--
INSERT INTO usuarios (id, nombre, email) VALUES
    (1, 'Usuario1', 'usuario1@example.com'),
    (2, 'Usuario2', 'usuario2@example.com');

INSERT INTO localizaciones ( usuario_id, latitud, longitud) VALUES
    (1, 40.7128, -74.0060),  
    (1, 34.0522, -118.2437), 
    (2, 51.5074, -0.1278);   