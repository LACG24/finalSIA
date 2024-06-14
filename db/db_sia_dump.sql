-- Establecer la zona horaria para la sesión actual
SET time_zone = 'America/Mexico_City';

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `db_sia` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Usar la base de datos recién creada
USE `db_sia`;


DROP TABLE IF EXISTS `Marca`;


CREATE TABLE `Marca` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_nombre` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




INSERT INTO `Marca` VALUES (1,'Del Valle'),(2,'Lipton'),(4,'Fud'),(5,'Bachoco'),(6,'Bimbo'),(33,'Kellogs');


DROP TABLE IF EXISTS `UnidadMedida`;


CREATE TABLE `UnidadMedida` (
  `um_id` varchar(5) NOT NULL,
  `um_nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`um_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `UnidadMedida` VALUES ('bag','bolsas'),('box','cajas'),('btl','botellas'),('cL','centilitros'),('cm','centimetros'),('cn','latas'),('cup','tazas'),('dL','decilitros'),('dz','docena'),('fl_oz','onzas fluidas'),('g','gramos'),('gal','galones'),('jar','frascos'),('Kg','Kilogramos'),('L','litros'),('lb','libras'),('m','metros'),('mg','miligramos'),('mL','mililitros'),('mm','milimetros'),('oz','onzas'),('p','paquetes'),('pt','pintas'),('qt','cuartos'),('t','toneladas'),('Tbsp','cucharadas'),('tsp','cucharaditas'),('U','Unidad');


DROP TABLE IF EXISTS `Usuario`;


CREATE TABLE `Usuario` (
  `u_id` varchar(20) NOT NULL,
  `u_nombre` varchar(40) DEFAULT NULL,
  `u_apellidos` varchar(40) DEFAULT NULL,
  `u_email` varchar(50) DEFAULT NULL,
  `u_pass` varchar(64) DEFAULT NULL,
  `u_rol` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`u_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




INSERT INTO `Usuario` VALUES ('ManejadorEventos','Event','Handler','','',1),('SAdmin','Giselle','Hernandez','giselle@example.com','38f015a3d771e6f0854989ff3a0f4051efaece727cc42be1dab1e514022bbb42',1), ('User01','Giselle','Hernandez', 'user01@example.com','67ed235e1e075a7214902e1af0cb4bb4ad3ba0fcf084411418074cf4247004cc', NULL);




DROP TABLE IF EXISTS `Alimento`;


CREATE TABLE `Alimento` (
  `a_id` int NOT NULL AUTO_INCREMENT,
  `a_nombre` varchar(30) DEFAULT NULL,
  `a_cantidad` decimal(13,3) DEFAULT NULL,
  `a_stock` int DEFAULT NULL,
  `a_fechaSalida` date DEFAULT NULL,
  `a_fechaEntrada` date DEFAULT NULL,
  `a_fechaCaducidad` date DEFAULT NULL,
  `um_id` varchar(4) DEFAULT NULL,
  `m_id` int DEFAULT NULL,
  PRIMARY KEY (`a_id`),
  KEY `um_id` (`um_id`),
  KEY `m_id` (`m_id`),
  CONSTRAINT `Alimento_ibfk_1` FOREIGN KEY (`um_id`) REFERENCES `UnidadMedida` (`um_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Alimento_ibfk_2` FOREIGN KEY (`m_id`) REFERENCES `Marca` (`m_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=270 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;







DROP TABLE IF EXISTS `UsuarioAlimento`;


CREATE TABLE `UsuarioAlimento` (
  `ua_id` int NOT NULL AUTO_INCREMENT,
  `u_id` varchar(20) DEFAULT NULL,
  `a_id` int DEFAULT NULL,
  `ua_cantidad` int DEFAULT NULL,
  `ua_accion` varchar(10) DEFAULT NULL,
  `ua_fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`ua_id`),
  KEY `u_id` (`u_id`),
  KEY `a_id` (`a_id`),
  CONSTRAINT `UsuarioAlimento_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `Usuario` (`u_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `UsuarioAlimento_ibfk_2` FOREIGN KEY (`a_id`) REFERENCES `Alimento` (`a_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



DELIMITER //


CREATE FUNCTION contarRegistrosUsuario(usuario_id VARCHAR(20)) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total_registros INT;
    
    SELECT COUNT(*) INTO total_registros
    FROM UsuarioAlimento
    WHERE u_id = usuario_id AND ua_accion = 'Add';
    
    RETURN total_registros;
END //


DELIMITER ;



DELIMITER //


CREATE PROCEDURE stockAlimentos (IN alimento_id INT, IN usuario_id VARCHAR(20), IN actionType INT, IN quantity INT)
BEGIN
    -- Add Reduce Update = 0 1 2 
    CASE actionType
        WHEN 0 THEN
            -- Código para manejar el tipo de acción add
            UPDATE Alimento
            SET a_stock = a_stock + quantity, a_fechaEntrada = DATE_SUB(NOW(), INTERVAL 6 HOUR)
            WHERE a_id = alimento_id;
            
            INSERT INTO UsuarioAlimento (u_id, a_id, ua_cantidad, ua_accion, ua_fecha) VALUES (usuario_id, alimento_id, quantity, "Add", DATE_SUB(NOW(), INTERVAL 6 HOUR));
        WHEN 1 THEN
            -- Código para manejar el tipo de acción reduce
            UPDATE Alimento
            SET a_stock = a_stock - quantity, a_fechaSalida = DATE_SUB(NOW(), INTERVAL 6 HOUR)
            WHERE a_id = alimento_id;
            
            INSERT INTO UsuarioAlimento (u_id, a_id, ua_cantidad, ua_accion, ua_fecha) VALUES (usuario_id, alimento_id, quantity, "Reduce",DATE_SUB(NOW(), INTERVAL 6 HOUR));
            
        WHEN 2 THEN
            -- Código para manejar el tipo de acción 2
            INSERT INTO UsuarioAlimento (u_id, a_id, ua_cantidad, ua_accion, ua_fecha) 
            VALUES (usuario_id, alimento_id, quantity, "Update", DATE_SUB(NOW(), INTERVAL 6 HOUR));


    END CASE;
    
END //


DELIMITER ;


DELIMITER //


CREATE EVENT eliminarAlimentosAntiguos
ON SCHEDULE EVERY 1 MONTH
DO
BEGIN
    DECLARE num_alimentos_eliminados INT;
    
    -- Contar el número de alimentos que cumplen las condiciones
    SELECT COUNT(*) INTO num_alimentos_eliminados
    FROM Alimento
    WHERE a_stock = 0 AND a_fechaSalida <= DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Eliminar todas las entradas de la tabla Alimento que cumplen las condiciones
    DELETE FROM Alimento
    WHERE a_stock = 0 AND a_fechaSalida <= DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Guardar el número de alimentos eliminados en la tabla UsuarioAlimento
    IF num_alimentos_eliminados > 0 THEN
        INSERT INTO UsuarioAlimento (u_id, a_id, ua_cantidad, ua_accion, ua_fecha)
        VALUES ('ManejadorEventos', NULL, num_alimentos_eliminados, 'Delete', DATE_SUB(NOW(), INTERVAL 6 HOUR));
    END IF;
END //


DELIMITER ;



