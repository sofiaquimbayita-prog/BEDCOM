-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: bedcom
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add Evento',7,'add_calendario'),(22,'Can change Evento',7,'change_calendario'),(23,'Can delete Evento',7,'delete_calendario'),(24,'Can view Evento',7,'view_calendario'),(25,'Can add CategorÃ­a',8,'add_categoria'),(26,'Can change CategorÃ­a',8,'change_categoria'),(27,'Can delete CategorÃ­a',8,'delete_categoria'),(28,'Can view CategorÃ­a',8,'view_categoria'),(29,'Can add Cliente',9,'add_cliente'),(30,'Can change Cliente',9,'change_cliente'),(31,'Can delete Cliente',9,'delete_cliente'),(32,'Can view Cliente',9,'view_cliente'),(33,'Can add Proveedor',20,'add_proveedor'),(34,'Can change Proveedor',20,'change_proveedor'),(35,'Can delete Proveedor',20,'delete_proveedor'),(36,'Can view Proveedor',20,'view_proveedor'),(37,'Can add Respaldo',22,'add_respaldo'),(38,'Can change Respaldo',22,'change_respaldo'),(39,'Can delete Respaldo',22,'delete_respaldo'),(40,'Can view Respaldo',22,'view_respaldo'),(41,'Can add usuario',25,'add_usuario'),(42,'Can change usuario',25,'change_usuario'),(43,'Can delete usuario',25,'delete_usuario'),(44,'Can view usuario',25,'view_usuario'),(45,'Can add Insumo',14,'add_insumo'),(46,'Can change Insumo',14,'change_insumo'),(47,'Can delete Insumo',14,'delete_insumo'),(48,'Can view Insumo',14,'view_insumo'),(49,'Can add Pedido',18,'add_pedido'),(50,'Can change Pedido',18,'change_pedido'),(51,'Can delete Pedido',18,'delete_pedido'),(52,'Can view Pedido',18,'view_pedido'),(53,'Can add pago',17,'add_pago'),(54,'Can change pago',17,'change_pago'),(55,'Can delete pago',17,'delete_pago'),(56,'Can view pago',17,'view_pago'),(57,'Can add Producto',19,'add_producto'),(58,'Can change Producto',19,'change_producto'),(59,'Can delete Producto',19,'delete_producto'),(60,'Can view Producto',19,'view_producto'),(61,'Can add Mantenimiento',15,'add_mantenimiento'),(62,'Can change Mantenimiento',15,'change_mantenimiento'),(63,'Can delete Mantenimiento',15,'delete_mantenimiento'),(64,'Can view Mantenimiento',15,'view_mantenimiento'),(65,'Can add detalle_pedido',12,'add_detalle_pedido'),(66,'Can change detalle_pedido',12,'change_detalle_pedido'),(67,'Can delete detalle_pedido',12,'delete_detalle_pedido'),(68,'Can view detalle_pedido',12,'view_detalle_pedido'),(69,'Can add Entrada de Producto',13,'add_entrada'),(70,'Can change Entrada de Producto',13,'change_entrada'),(71,'Can delete Entrada de Producto',13,'delete_entrada'),(72,'Can view Entrada de Producto',13,'view_entrada'),(73,'Can add Reporte',21,'add_reporte'),(74,'Can change Reporte',21,'change_reporte'),(75,'Can delete Reporte',21,'delete_reporte'),(76,'Can view Reporte',21,'view_reporte'),(77,'Can add Salida de Producto',23,'add_salida_producto'),(78,'Can change Salida de Producto',23,'change_salida_producto'),(79,'Can delete Salida de Producto',23,'delete_salida_producto'),(80,'Can view Salida de Producto',23,'view_salida_producto'),(81,'Can add SupervisiÃ³n',24,'add_supervision'),(82,'Can change SupervisiÃ³n',24,'change_supervision'),(83,'Can delete SupervisiÃ³n',24,'delete_supervision'),(84,'Can view SupervisiÃ³n',24,'view_supervision'),(85,'Can add Despacho',11,'add_despacho'),(86,'Can change Despacho',11,'change_despacho'),(87,'Can delete Despacho',11,'delete_despacho'),(88,'Can view Despacho',11,'view_despacho'),(89,'Can add NotificaciÃ³n',16,'add_notificacion'),(90,'Can change NotificaciÃ³n',16,'change_notificacion'),(91,'Can delete NotificaciÃ³n',16,'delete_notificacion'),(92,'Can view NotificaciÃ³n',16,'view_notificacion'),(93,'Can add bom (Estructura de Producto)',6,'add_bom'),(94,'Can change bom (Estructura de Producto)',6,'change_bom'),(95,'Can delete bom (Estructura de Producto)',6,'delete_bom'),(96,'Can view bom (Estructura de Producto)',6,'view_bom'),(97,'Can add compra',10,'add_compra'),(98,'Can change compra',10,'change_compra'),(99,'Can delete compra',10,'delete_compra'),(100,'Can view compra',10,'view_compra'),(101,'Can add access attempt',26,'add_accessattempt'),(102,'Can change access attempt',26,'change_accessattempt'),(103,'Can delete access attempt',26,'delete_accessattempt'),(104,'Can view access attempt',26,'view_accessattempt'),(105,'Can add access log',29,'add_accesslog'),(106,'Can change access log',29,'change_accesslog'),(107,'Can delete access log',29,'delete_accesslog'),(108,'Can view access log',29,'view_accesslog'),(109,'Can add access failure',28,'add_accessfailurelog'),(110,'Can change access failure',28,'change_accessfailurelog'),(111,'Can delete access failure',28,'delete_accessfailurelog'),(112,'Can view access failure',28,'view_accessfailurelog'),(113,'Can add access attempt expiration',27,'add_accessattemptexpiration'),(114,'Can change access attempt expiration',27,'change_accessattemptexpiration'),(115,'Can delete access attempt expiration',27,'delete_accessattemptexpiration'),(116,'Can view access attempt expiration',27,'view_accessattemptexpiration'),(117,'Can add historial chat',30,'add_historialchat'),(118,'Can change historial chat',30,'change_historialchat'),(119,'Can delete historial chat',30,'delete_historialchat'),(120,'Can view historial chat',30,'view_historialchat'),(121,'Can add group',31,'add_group'),(122,'Can change group',31,'change_group'),(123,'Can delete group',31,'delete_group'),(124,'Can view group',31,'view_group'),(125,'Can add push information',32,'add_pushinformation'),(126,'Can change push information',32,'change_pushinformation'),(127,'Can delete push information',32,'delete_pushinformation'),(128,'Can view push information',32,'view_pushinformation'),(129,'Can add subscription info',33,'add_subscriptioninfo'),(130,'Can change subscription info',33,'change_subscriptioninfo'),(131,'Can delete subscription info',33,'delete_subscriptioninfo'),(132,'Can view subscription info',33,'view_subscriptioninfo');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `axes_accessattempt`
--

DROP TABLE IF EXISTS `axes_accessattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `axes_accessattempt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_agent` varchar(255) NOT NULL,
  `ip_address` char(39) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `http_accept` varchar(1025) NOT NULL,
  `path_info` varchar(255) NOT NULL,
  `attempt_time` datetime(6) NOT NULL,
  `get_data` longtext NOT NULL,
  `post_data` longtext NOT NULL,
  `failures_since_start` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `axes_accessattempt_username_ip_address_user_agent_8ea22282_uniq` (`username`,`ip_address`,`user_agent`),
  KEY `axes_accessattempt_ip_address_10922d9c` (`ip_address`),
  KEY `axes_accessattempt_user_agent_ad89678b` (`user_agent`),
  KEY `axes_accessattempt_username_3f2d4ca0` (`username`),
  CONSTRAINT `axes_accessattempt_chk_1` CHECK ((`failures_since_start` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `axes_accessattempt`
--

LOCK TABLES `axes_accessattempt` WRITE;
/*!40000 ALTER TABLE `axes_accessattempt` DISABLE KEYS */;
/*!40000 ALTER TABLE `axes_accessattempt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `axes_accessattemptexpiration`
--

DROP TABLE IF EXISTS `axes_accessattemptexpiration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `axes_accessattemptexpiration` (
  `access_attempt_id` int NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  PRIMARY KEY (`access_attempt_id`),
  CONSTRAINT `axes_accessattemptex_access_attempt_id_6b73a47a_fk_axes_acce` FOREIGN KEY (`access_attempt_id`) REFERENCES `axes_accessattempt` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `axes_accessattemptexpiration`
--

LOCK TABLES `axes_accessattemptexpiration` WRITE;
/*!40000 ALTER TABLE `axes_accessattemptexpiration` DISABLE KEYS */;
/*!40000 ALTER TABLE `axes_accessattemptexpiration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `axes_accessfailurelog`
--

DROP TABLE IF EXISTS `axes_accessfailurelog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `axes_accessfailurelog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_agent` varchar(255) NOT NULL,
  `ip_address` char(39) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `http_accept` varchar(1025) NOT NULL,
  `path_info` varchar(255) NOT NULL,
  `attempt_time` datetime(6) NOT NULL,
  `locked_out` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `axes_accessfailurelog_user_agent_ea145dda` (`user_agent`),
  KEY `axes_accessfailurelog_ip_address_2e9f5a7f` (`ip_address`),
  KEY `axes_accessfailurelog_username_a8b7e8a4` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `axes_accessfailurelog`
--

LOCK TABLES `axes_accessfailurelog` WRITE;
/*!40000 ALTER TABLE `axes_accessfailurelog` DISABLE KEYS */;
/*!40000 ALTER TABLE `axes_accessfailurelog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `axes_accesslog`
--

DROP TABLE IF EXISTS `axes_accesslog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `axes_accesslog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_agent` varchar(255) NOT NULL,
  `ip_address` char(39) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `http_accept` varchar(1025) NOT NULL,
  `path_info` varchar(255) NOT NULL,
  `attempt_time` datetime(6) NOT NULL,
  `logout_time` datetime(6) DEFAULT NULL,
  `session_hash` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `axes_accesslog_ip_address_86b417e5` (`ip_address`),
  KEY `axes_accesslog_user_agent_0e659004` (`user_agent`),
  KEY `axes_accesslog_username_df93064b` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `axes_accesslog`
--

LOCK TABLES `axes_accesslog` WRITE;
/*!40000 ALTER TABLE `axes_accesslog` DISABLE KEYS */;
INSERT INTO `axes_accesslog` VALUES (1,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-05-22 16:31:03.050747',NULL,'aea7ca5882852b776b5fb5ac4b9b78f5f307de2725b78636786b64e4b979ebdb'),(2,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-05-22 16:35:56.886342',NULL,'a16955f79d98e2865616d9e1d09e79b66b2191e5748ab65842ac3929676fde4e'),(3,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-05-24 23:36:19.907568',NULL,'f450ace0713e637d7d1f43335d5b3276c010fbc483bdfddae57f9bba72948d66'),(4,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-13 14:48:18.456958',NULL,'61c23d1a0a1143c7b0fbd9e74caf0364c90a701e71b573f19a7a6bae5772391f'),(5,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-13 14:50:23.672037',NULL,'431fe6cbdcc8eef1aaf6a23b62bc53dd7583d6aaec0ab9ea47ee9ddb4faf66ff'),(6,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-17 14:38:09.499839','2026-06-17 14:38:40.543045','85c3199e05805379f5edd816ff7fce50e5b08c516e995517cfb7ec2e38ce0058'),(7,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 02:16:23.613423','2026-06-19 02:17:45.617062','11bf0a2adbd7ee7eb9dddc5804651c6b5ac7b37cb7b7c14a15980bec438da5e3'),(8,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 02:24:57.089228',NULL,'d6994668bc80c0318f464b1de372937faf1b1cb3d216c7a8ce9a108aa3a1d7a1'),(9,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1D','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 12:56:14.621264','2026-06-19 15:14:43.913898','3ef404dd921b2a2c6770f17cd406d0bdbc5a29dcbe333aa63f1b84993383e42b'),(10,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1D','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 15:15:43.888070','2026-06-19 15:42:47.711174','28e0672829fa7ffab3dbc4f44e0844f8079ba2d53f7fb1da8fcfe85220850da4'),(11,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 15:45:24.613950','2026-06-19 15:54:34.901642','0c9cb04e06fbc828f8b8a0d34e823d61d3e35df3ac2b482366baebec4834f1b1'),(12,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1D','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 15:56:39.057088','2026-06-19 16:03:49.377361','2883b9717c76cd1512b50b4303fbd78dcdc82e5761827af9e149f6c54ac8fe32'),(13,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 16:07:00.614831',NULL,'8e28b82fe25adc92a1a307502e833b78b7a325aec39e7bdfc0ed809e014bd208'),(14,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-19 16:09:47.589957',NULL,'48e4dea7a7bd0387180adeaed6373357e3747dc00e6248fe0abc18d86a6ee9f0'),(15,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 11:52:28.909443','2026-06-22 13:34:23.921469','8ab8a0f472200a51615bd1ae8ca2b0a4d8e41c96797940b73545480ea2e99281'),(16,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 13:38:19.704364','2026-06-22 13:38:28.700111','a97280d7dcb57a66383c2ebb345a52b72aabce683733fe0f1f9d166abc3ad070'),(17,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 13:41:57.434494','2026-06-22 13:53:58.126834','3c3aca80c7d5c6609c26b52628ba3d9218fc7f63edf0c69fd9f7f67e6a89e98b'),(18,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 14:41:39.664102','2026-06-22 14:42:55.303393','6ef20ee19220cb230f1db7014ff0da515ee0005dc24a5f71bed82837f1bb2a1c'),(19,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 14:45:43.961162',NULL,'b4576cd536de79aa1dccc8da67c6855fc2168544990fb9cbd9884976a22434d4'),(20,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','127.0.0.1','pedro','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 14:48:17.336167',NULL,'6883d50503c4d21265a944f0e084324b63b2caebd6066191bac88b4a5b25a2d9'),(21,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 14:52:26.002560',NULL,'7ca123202c7226f2faf31afd5e3d3c47db563e4ddb4ed22070e9942880d2aea2'),(22,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','127.0.0.1','Sofia','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-22 15:15:14.242454',NULL,'e8ecf58f1e42e22b00ef4d69b2d8e0f02bd8be545b2ae4a09b9348b8d28bd787'),(23,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 00:23:59.847004',NULL,'b8639fe5b0002468b5c8e29d87bf85973d21830de305c567c892f8398db99b75'),(24,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8','/login/login/','2026-06-23 00:30:36.862258',NULL,'59b67488b23c0a9869d640a719af314d30d7cfa32394bfd2b07093b0c46001a3'),(25,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','127.0.0.1','pedro','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 00:39:51.716293',NULL,'5ac3158d965e58eda60ed05bc563b0d68ba415f7e6cff756ecbfc08c75e21f2e'),(26,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 12:03:13.741546','2026-06-23 14:34:04.508945','dd301b5a7b06483d3d164c8ee7c9b4525bee3e980a5888bbf889d607e8f4c210'),(27,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:17:37.764776','2026-06-23 15:24:24.670337','d12ae2431740f1621f8eb025b2e5d4f79d38aef46e077311dcc0e1f3083eba5d'),(28,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:24:38.544291','2026-06-23 15:24:42.304330','f379062b85af99d23711b46e655e990adb41f403528b297218e2a6aea1069fdc'),(29,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:26:46.616485',NULL,'664948357f0a7cbf87688677dfb7cebd6d58502bd035eedbc300b4c1c58d5dc1'),(30,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:26:47.593201',NULL,'47b46e1f2a947b5e75b8ee488811cf04ca4a3408a792c8f22efd297e57f90f4b'),(31,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:26:48.886389',NULL,'68a58ef15c96d7b3bb0f35f84fa38fa0bd80ccfd2ebf5bbf14ebdb7ba11c5dd0'),(32,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:26:49.208946','2026-06-23 15:41:36.488405','c6461992909b2a16924b1c4590a6d500ac8708f461736bde91be268dce318e12'),(33,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 15:52:19.076462','2026-06-30 17:16:09.520694','a0baca3ef718298c6d329cfdbefe100dd61fcbfe3dee5e6778f2164aa608ae25'),(34,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','127.0.0.1','Sofia','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 16:13:37.359901',NULL,'0c0d2edcd80a8ec1d948862670cd711813b3fad67fedb8d5868ecd5db0078da6'),(35,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-23 16:22:54.871148',NULL,'9cea9a8f4628b5c8dd95bf4f934b909d10032dc7054ded357cb3da1efc585284'),(36,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-29 13:48:09.135590','2026-06-30 10:39:44.507401','abcb906949c3a949c9b3ea381da2f371230cf3f0d2953ab828420d63d99ad18c'),(37,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-30 12:31:21.570330','2026-06-30 13:22:56.848567','d4531c04e88e66b7c7f7d8a5a9337e0c3e5535ab4ff5a4f7ccc54f7e8fe90def'),(38,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-30 13:24:38.964734','2026-06-30 14:04:16.696114','fa0f7c989002a124f8fab642f2b9ed3474ce6824a1f3e802c34e7f50ef4b7842'),(39,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-30 14:04:41.817890',NULL,'7aa445804366f488c5fcf946b0b56c5d49732412f8d6ce840c7790ebf5c4e548'),(40,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0','127.0.0.1','D4V1DMC','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/login/','2026-06-30 17:18:35.786412',NULL,'b23ba361395f779941f8c0de7b589517fb6a0444974891ce11f048fd9f1c4757');
/*!40000 ALTER TABLE `axes_accesslog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendario`
--

DROP TABLE IF EXISTS `calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time(6) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `descripcion` longtext,
  `modo_completado` varchar(15) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendario`
--

LOCK TABLES `calendario` WRITE;
/*!40000 ALTER TABLE `calendario` DISABLE KEYS */;
INSERT INTO `calendario` VALUES (1,'compra de madera','2026-06-24','09:50:00.000000','logistica','','manual','pendiente'),(2,'fabricar 12 base camas','2026-06-23','09:51:00.000000','produccion','Fabricar','manual','pendiente'),(3,'entrega de base camas','2026-06-25','11:19:00.000000','logistica','45454545','automatico','completado'),(4,'Mantenimiento de compresor','2026-06-24','09:52:00.000000','admin','','automatico','completado'),(5,'auditoria','2026-06-24','14:53:00.000000','logistica','','manual','completado'),(6,'compra de insumos','2026-06-22','13:52:00.000000','inventario','','automatico','completado'),(7,'ReuniÃ³n producciÃ³n semanal','2026-06-30','09:00:00.000000','produccion','Evento de prueba: ReuniÃ³n producciÃ³n semanal','automatico','completado'),(8,'Inventario general bodega','2026-07-02','09:00:00.000000','inventario','Evento de prueba: Inventario general bodega','automatico','pendiente'),(9,'Entrega pedido cliente especial','2026-07-04','09:00:00.000000','logistica','Evento de prueba: Entrega pedido cliente especial','automatico','pendiente'),(10,'RevisiÃ³n de nÃ³mina','2026-07-01','09:00:00.000000','admin','Evento de prueba: RevisiÃ³n de nÃ³mina','automatico','pendiente'),(11,'ventass','2026-07-09','12:31:00.000000','produccion','cosas','manual','pendiente');
/*!40000 ALTER TABLE `calendario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` longtext NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Base Camas','Son las estructuras diseÃ±adas exclusivamente para sostener el colchÃ³n, sin incluir cabeceros altos.','producto',1),(2,'Maderas','Madera para camas','insumo',1),(3,'Espaldares-Cabeceros','Piezas independientes que se venden para complementar una base cama, apoyarse contra la pared o anclarse a la estructura.','producto',1),(4,'Camas Completas','Muebles que integran en un solo producto la estructura de soporte larguerostablas y el espaldar a juego.','producto',1),(5,'Maderas y Derivados','Listones de pinoeucalipto, lÃ¡minas de MDF, MDP, aglomerados y triplex.','insumo',1),(6,'Metales y Perfiles','TuberÃ­a de acero, Ã¡ngulos metÃ¡licos y marcos prefabricados.','insumo',1),(7,'Telas Externas','Cuerinas, linos, terciopelos, microfibras y jacquard.','insumo',1),(8,'Telas de Soporte','Tela cover antideslizante para la tapa y tela cambrequirÃºrgica.','insumo',1),(9,'Espumas y Rellenos','LÃ¡minas de espuma de diferentes densidades D23, D26, etc., guata y algodÃ³n laminado.','insumo',1),(10,'Soportes y Movilidad','Patas y rodachinas','insumo',1),(11,'Sistemas MecÃ¡nicos','Pistones hidrÃ¡ulicos amortiguadores a gas para baÃºles y mecanismos para camas abatibles.','insumo',1),(12,'Fijaciones y Uniones','Platinas de anclaje, Ã¡ngulos de esquina, tornillos, pernos y tuercas.','insumo',1),(13,'FijaciÃ³n RÃ¡pida','Grapas industriales Grapas industriales','insumo',1),(14,'QuÃ­micos y Pegantes','Pegante para madera colbÃ³n industrial, pegante de contacto bÃ³xer o en spray y lacastintes para acabados de madera.','insumo',1),(15,'Base Camas Auxiliares','Bases para colchÃ³n con una cama inferior deslizable e independiente.','producto',0),(16,'Muebles','CategorÃ­a de producto: Muebles','producto',1),(17,'TapicerÃ­a','CategorÃ­a de producto: TapicerÃ­a','producto',1),(18,'Melamina','CategorÃ­a de producto: Melamina','producto',1),(19,'Herrajes','CategorÃ­a de insumo: Herrajes','insumo',1),(20,'Telas','CategorÃ­a de insumo: Telas','insumo',1);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `es_especial` tinyint(1) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (2,'pedro paramo','565 656 5656','calle343 3',NULL,0,1),(3,'Mario Zapata','454 654 6465','calle 45 #45','mario@gmail.com',1,1),(4,'Carlos Alberto GÃ³mez Restrepo','315 456 7890','Calle 26 #45-12, BogotÃ¡',NULL,0,0),(5,'MarÃ­a Camila Torres Rojas','320 987 6543','Carrera 10 #15-34, Tunja','matorres@outlook.com',1,1),(6,'Carlos MÃ©ndez','3001112233','Calle 45 #22-11, MedellÃ­n','carlos.mÃ©ndez@email.com',0,1),(7,'MarÃ­a GarcÃ­a','3105544332','Cra 72 #33-10, BogotÃ¡','marÃ­a.garcÃ­a@email.com',1,1),(8,'Pedro RamÃ­rez','3209876543','Av. Nutibara #12-34, MedellÃ­n','pedro.ramÃ­rez@email.com',0,1),(9,'Laura Castillo','3156789012','Calle 10 #5-67, Cali','laura.castillo@email.com',1,1),(10,'David Mendivelso','322 374 3761','Chameza Menor','edgarmencuy@gmail.com',0,1);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `despacho`
--

DROP TABLE IF EXISTS `despacho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `despacho` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) NOT NULL,
  `fecha_despacho` datetime(6) NOT NULL,
  `fecha_entrega_real` datetime(6) DEFAULT NULL,
  `direccion_entrega` varchar(200) NOT NULL,
  `telefono_contacto` varchar(15) NOT NULL,
  `observaciones` longtext,
  `responsable` varchar(100) DEFAULT NULL,
  `empresa_transporte` varchar(100) DEFAULT NULL,
  `numero_guia` varchar(100) DEFAULT NULL,
  `costo_envio` decimal(12,2) NOT NULL,
  `pedido_id` bigint NOT NULL,
  `supervision_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_id` (`pedido_id`),
  KEY `despacho_supervision_id_70f698b3_fk_supervision_id` (`supervision_id`),
  CONSTRAINT `despacho_pedido_id_b9615fc5_fk_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`),
  CONSTRAINT `despacho_supervision_id_70f698b3_fk_supervision_id` FOREIGN KEY (`supervision_id`) REFERENCES `supervision` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `despacho`
--

LOCK TABLES `despacho` WRITE;
/*!40000 ALTER TABLE `despacho` DISABLE KEYS */;
INSERT INTO `despacho` VALUES (2,'en_ruta','2026-06-22 14:58:06.605801',NULL,'calle343 3','565 656 5656',NULL,'paramo pedro','luis','W231H6',20000.00,2,NULL),(4,'pendiente','2026-06-29 21:56:22.355818',NULL,'Calle 45 #22-11, MedellÃ­n','3001112233',NULL,'Juan Despachador','Coordinadora','GUI-53808',15000.00,4,1),(5,'en_ruta','2026-06-29 21:56:22.362880',NULL,'Calle 10 #5-67, Cali','3156789012',NULL,'Juan Despachador','Coordinadora','GUI-95316',15000.00,7,1),(6,'pendiente','2026-06-30 17:25:25.922023',NULL,'Chameza Menor','322 374 3761',NULL,'Edgar David Mendivelso Cuy','pedro','GFD555',200000.00,9,NULL);
/*!40000 ALTER TABLE `despacho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido`
--

DROP TABLE IF EXISTS `detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedido` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `es_personalizado` tinyint(1) NOT NULL,
  `especificaciones` longtext,
  `observaciones` longtext,
  `pedido_id` bigint NOT NULL,
  `producto_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_pedido_pedido_id_75d4855e_fk_pedido_id` (`pedido_id`),
  KEY `detalle_pedido_producto_id_bc3adbcb_fk_productos_id` (`producto_id`),
  CONSTRAINT `detalle_pedido_pedido_id_75d4855e_fk_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`),
  CONSTRAINT `detalle_pedido_producto_id_bc3adbcb_fk_productos_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido`
--

LOCK TABLES `detalle_pedido` WRITE;
/*!40000 ALTER TABLE `detalle_pedido` DISABLE KEYS */;
INSERT INTO `detalle_pedido` VALUES (7,1,850000.00,850000.00,0,'','',2,3),(8,1,580000.00,580000.00,0,'','',2,4),(13,2,450000.00,900000.00,0,NULL,NULL,4,6),(14,4,45000.00,180000.00,0,NULL,NULL,4,9),(15,2,450000.00,900000.00,0,NULL,NULL,5,6),(16,4,45000.00,180000.00,0,NULL,NULL,5,9),(17,2,450000.00,900000.00,0,NULL,NULL,6,6),(18,4,45000.00,180000.00,0,NULL,NULL,6,9),(19,2,450000.00,900000.00,0,NULL,NULL,7,6),(20,4,45000.00,180000.00,0,NULL,NULL,7,9),(21,1,450000.00,450000.00,0,'','',8,2),(22,2,850000.00,1700000.00,0,'','',9,3),(23,1,26000.00,26000.00,0,'','',10,1);
/*!40000 ALTER TABLE `detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_usuarios_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_usuarios_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(6,'app','bom'),(7,'app','calendario'),(8,'app','categoria'),(9,'app','cliente'),(10,'app','compra'),(11,'app','despacho'),(12,'app','detalle_pedido'),(13,'app','entrada'),(14,'app','insumo'),(15,'app','mantenimiento'),(16,'app','notificacion'),(17,'app','pago'),(18,'app','pedido'),(19,'app','producto'),(20,'app','proveedor'),(21,'app','reporte'),(22,'app','respaldo'),(23,'app','salida_producto'),(24,'app','supervision'),(25,'app','usuario'),(2,'auth','group'),(3,'auth','permission'),(26,'axes','accessattempt'),(27,'axes','accessattemptexpiration'),(28,'axes','accessfailurelog'),(29,'axes','accesslog'),(4,'contenttypes','contenttype'),(30,'ia','historialchat'),(5,'sessions','session'),(31,'webpush','group'),(32,'webpush','pushinformation'),(33,'webpush','subscriptioninfo');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-05-22 16:29:29.733017'),(2,'contenttypes','0002_remove_content_type_name','2026-05-22 16:29:29.840848'),(3,'auth','0001_initial','2026-05-22 16:29:30.079593'),(4,'auth','0002_alter_permission_name_max_length','2026-05-22 16:29:30.129852'),(5,'auth','0003_alter_user_email_max_length','2026-05-22 16:29:30.135626'),(6,'auth','0004_alter_user_username_opts','2026-05-22 16:29:30.141067'),(7,'auth','0005_alter_user_last_login_null','2026-05-22 16:29:30.147470'),(8,'auth','0006_require_contenttypes_0002','2026-05-22 16:29:30.149283'),(9,'auth','0007_alter_validators_add_error_messages','2026-05-22 16:29:30.154157'),(10,'auth','0008_alter_user_username_max_length','2026-05-22 16:29:30.160031'),(11,'auth','0009_alter_user_last_name_max_length','2026-05-22 16:29:30.166272'),(12,'auth','0010_alter_group_name_max_length','2026-05-22 16:29:30.178444'),(13,'auth','0011_update_proxy_permissions','2026-05-22 16:29:30.183851'),(14,'auth','0012_alter_user_first_name_max_length','2026-05-22 16:29:30.192036'),(15,'app','0001_initial','2026-05-22 16:29:31.895490'),(16,'admin','0001_initial','2026-05-22 16:29:31.997880'),(17,'admin','0002_logentry_remove_auto_add','2026-05-22 16:29:32.006297'),(18,'admin','0003_logentry_add_action_flag_choices','2026-05-22 16:29:32.016334'),(19,'app','0002_alter_mantenimiento_options_mantenimiento_estado_and_more','2026-05-22 16:29:32.242684'),(20,'app','0003_remove_historial_acciones','2026-05-22 16:29:32.251029'),(21,'axes','0001_initial','2026-05-22 16:29:32.275335'),(22,'axes','0002_auto_20151217_2044','2026-05-22 16:29:32.353954'),(23,'axes','0003_auto_20160322_0929','2026-05-22 16:29:32.363570'),(24,'axes','0004_auto_20181024_1538','2026-05-22 16:29:32.377589'),(25,'axes','0005_remove_accessattempt_trusted','2026-05-22 16:29:32.410793'),(26,'axes','0006_remove_accesslog_trusted','2026-05-22 16:29:32.448394'),(27,'axes','0007_alter_accessattempt_unique_together','2026-05-22 16:29:32.475736'),(28,'axes','0008_accessfailurelog','2026-05-22 16:29:32.525329'),(29,'axes','0009_add_session_hash','2026-05-22 16:29:32.562608'),(30,'axes','0010_accessattemptexpiration','2026-05-22 16:29:32.592450'),(31,'ia','0001_initial','2026-05-22 16:29:32.650864'),(32,'sessions','0001_initial','2026-05-22 16:29:32.677703'),(33,'webpush','0001_initial','2026-05-22 16:29:32.826008'),(34,'webpush','0002_auto_20190603_0005','2026-05-22 16:29:32.835036'),(35,'webpush','0003_subscriptioninfo_user_agent','2026-05-22 16:29:32.891566'),(36,'webpush','0004_auto_20220831_1500','2026-05-22 16:29:33.175658'),(37,'webpush','0005_auto_20230614_1529','2026-05-22 16:29:33.503772'),(38,'webpush','0006_alter_subscriptioninfo_user_agent','2026-05-22 16:29:33.506390');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('1hg8ifaktfxcq5a3oxczyo6vfz12wf8a','.eJxVi0kKwzAMAP-icwl2XC_KsdB3GMmScehCqJtTyd9DIYf2ODPMBzKt75bXrq88C0xg4fTrmMpNn99AyzIc1Ifrg-b75Wh_Q6PeYAKp3sfKAT3JWJJj9JSs4ZCQC6EYx2SlnKtBUo5FRDGM0Vhnq6iLsO0nLTKL:1wabkC:DSlnnPlXdUkhd-BDM452sUQZ1b2CqmuLwvGIP5eERYs','2026-07-03 16:07:00.624032'),('1ufia82yi4mjwhvl49jrjkcy8x9kzu69','.eJxVjMkKwjAURf8laynpEF_iUvA7wn1DSHGgGLsS_10KXejy3MM9b5exvmpemz3zrO7kenf43RhytccmsCzdTq273DHfzrv7O1S0umUmUwvMJlrKqJ7hUQKKxH4IYBIioZGn6PuSYkIkxqDEljjoUcx9vlHqM3c:1wec6V:f8TsBC2rL5QiK8nk842WTnBF8ONznYvp3yC9wfMQ_HA','2026-07-14 17:18:35.793813'),('2fbq22xsf7fye4705ev9zypdzb69kneq','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wbg0g:ToQCWR7teQ7agOQvis7b7BUZfYvSqaalf4N4na7E8XA','2026-07-06 14:52:26.019673'),('4k992srsnq9gyvt7u12eh1k2y6bl49s2','.eJxVi7sKwzAMAP9FcwmyItshY6HfYWRZxqEPQp1Mpf9eChna8e64FyTZt5b2bs-0FJjBwenXZdGrPb5B1nU4qA-Xuyy389H-hia9wQyT914je0INUjGqqUxauWI1lIIyWnCUkR0VV9mkUCQlHnN0gZXh_QESKTHT:1wYPek:tsSqh3CUogxiioNoOm30pgPx0JMl-d49m2cxNA5OL8U','2026-06-27 14:48:18.490309'),('8725aimquf8etycndv6zwirkhot45j54','.eJxVi7sKwzAMAP9FcwmyItshY6HfYWRZxqEPQp1Mpf9eChna8e64FyTZt5b2bs-0FJjBwenXZdGrPb5B1nU4qA-Xuyy389H-hia9wQyT914je0INUjGqqUxauWI1lIIyWnCUkR0VV9mkUCQlHnN0gZXh_QESKTHT:1wRIMl:MeLcGGz9YBsFkLHcInSFwkyLTHOGBmgOppC-0ueBwF8','2026-06-07 23:36:19.951027'),('9n80fkqy0m1yb34t7xyge0yy6ug7va0v','.eJxVi80KwjAQBt9lz1LIJqvdHgWfI3xJNqT4QzHtSXx3EXrQ48wwL4rY1ha3bs84F5rI0eHXJeSrPb4ByzLs1IfLHfPtvLe_oaE3mkiTgq0Ub16l2BhUGcxSxTSJQUOAnpAFmo0l1-pT8GzO8XGsZvT-ACDTMnE:1weZ4r:hdfFKnlsD01dRbrvpU2_riGSD_DiQEtvQB7TcNO9whI','2026-07-14 14:04:41.836465'),('9u80woldna8g2w720c405yvm4pgnwl8y','.eJxVi7sKwzAMAP9FcwmyItshY6HfYWRZxqEPQp1Mpf9eChna8e64FyTZt5b2bs-0FJjBwenXZdGrPb5B1nU4qA-Xuyy389H-hia9wQyT914je0INUjGqqUxauWI1lIIyWnCUkR0VV9mkUCQlHnN0gZXh_QESKTHT:1waOuf:hr7TsDIPjc6y6kFNFaqRsxssS1QQLAaTn6MuCbN2Xig','2026-07-03 02:24:57.099731'),('c9ypwkdk1bm8xmhy656fyzxk6njqm5vv','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wc31T:eRyGazjuNUv_PRm6v7L7dce9UgNNpJ8jM6dvTS-7SIs','2026-07-07 15:26:47.600920'),('eeaboh47wna8s8qpfeg4k6oxf8kx813a','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wc31U:oZR8jSpWSFWFTtwUT-Mb25fMea7jeOCTQMu0AqhNzeA','2026-07-07 15:26:48.894768'),('eghvi63u9qe18phfgvvy5ibhh625vrr2','.eJxVi8sKgzAQAP9lz6245mU8FvodYZPdoLVVMUoPpf9eCl48zgzzgbBQKe955bBKkS1s8ygTdMA0PjBfG4c2k2k1E4kmkxT7JmHNORlLtYcLBNq3PuxF1jAwdIBnFymNMv0DLUt1UKnuLxqet6Odhp5KDx3E3GLEyCStmMxeeV87RkVKS-TknLbWccJonE6sLKmGWBrlXIvZK4HvDxOWR2w:1wbfuB:SEvg9ybaB-54o8n3t1m1_PV_brX1SOcMq2FT2TvSNkE','2026-07-06 14:45:43.973218'),('fgj9sf89p61zjj9up8qqt1pm2grg5fbv','.eJxVi80KwjAQBt9lz1LIJqvdHgWfI3xJNqT4QzHtSXx3EXrQ48wwL4rY1ha3bs84F5rI0eHXJeSrPb4ByzLs1IfLHfPtvLe_oaE3mkiTgq0Ub16l2BhUGcxSxTSJQUOAnpAFmo0l1-pT8GzO8XGsZvT-ACDTMnE:1wc3tm:QZ84CfzXDiI9DLjMcUwLrJLPu-pi3XMqv5JGc2HsYus','2026-07-07 16:22:54.885777'),('hj0o7d3v6qv8j3ul6fe5lvqmb747dljl','.eJxVi7sKwzAMAP9FcwmyItshY6HfYWRZxqEPQp1Mpf9eChna8e64FyTZt5b2bs-0FJjBwenXZdGrPb5B1nU4qA-Xuyy389H-hia9wQyT914je0INUjGqqUxauWI1lIIyWnCUkR0VV9mkUCQlHnN0gZXh_QESKTHT:1wQSqq:tuBKukS3Lm7xyWmli6ftQalLRe4yRYsvXY7L03sBsqk','2026-06-05 16:35:56.893961'),('i889oe1f0jmy6gc8t24h896gzpzfvyyc','.eJxVi7sKwzAMAP9FcwmyItshY6HfYWRZxqEPQp1Mpf9eChna8e64FyTZt5b2bs-0FJjBwenXZdGrPb5B1nU4qA-Xuyy389H-hia9wQyT914je0INUjGqqUxauWI1lIIyWnCUkR0VV9mkUCQlHnN0gZXh_QESKTHT:1wQSm7:Mt4t4ehoy9tnpKMqG3MyPfjzM02qo3XBmHHVFqxqv28','2026-06-05 16:31:03.062495'),('ipqgirevu4i6sbupbfm4ovlld44nmhp4','.eJxVi0kKwzAMAP-icwmW40XOsdB3GMmWcehCaJJT6d9LIYf2ODPMCzLvW8_7qs88V5jAwenXCZerPr6Bl2U4aB0ud55v56P9DZ3XDhPUQE5QkLSholqJOKaA1KhG16IVtRxtNcWxmuJMEFs8UiI03o82wfsDBXUxBA:1wbgMk:4SxTW71sksmtgfe2ZkmWKt53Ql31hPjYEAorrg7KFqk','2026-07-06 15:15:14.266510'),('m0m61aqo3912gdeszs6a6cil9ll3h4kw','.eJxVi8sKwjAQAP9lz1J2k5g0PQp-R9jdbEnxQTH2JP67CD3ocWaYFxTenq1s3R5lqTCBh8OvE9aL3b-B13XYqQ_nGy_X097-hsa9wQQJK8dEwharIQU1PIbZhJ2SRCdjEM_Zpexr1oqGNhLNWZk0iiaB9wckVDKf:1wbpB9:wQtmYE5ZKLB_rXgCnMMHEZv1uj4eueVurD_iuN1BAFo','2026-07-07 00:39:51.723094'),('n2k3ocshu0d6ubv2go1kxoa29f2ewpf1','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wbovn:G6-p8dOyBR3o3ACEPTILEjCYlD-qDaloYK4v463eauw','2026-07-07 00:23:59.880562'),('nby8l5lig8ytitnbrfn7ln5zmrokfhrm','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wbp2C:unLvQaFFwMmTS1cDwiCriN7dp9Eih77O8W8aYgl_-_Y','2026-07-07 00:30:36.875423'),('q21a0qe280kc63bj98t12tznnyqgos1o','.eJxVi8sKwjAQAP9lz1JMN80mPQp-R9jNbkjxQTH2JP67CD3ocWaYF2Teni1v3R55UZjBweHXCZeL3b-B13XYqQ_nGy_X097-hsa9wQxSoxMnyhZtqpowpSOpQ0ZvooXIh0BanEzki2JgHFltRKLoakKD9wcpSzI0:1wc31S:XkmPCbtStAGVyHcNpDv-SKv7FN7Mq3-8XecGxaemZ9M','2026-07-07 15:26:46.626579'),('rg5ko3cweummj55uzbhjl27uclfraopk','.eJxVi8sKwyAQAP9lzyWs66oxx0K_Q1bdYOiDUJNT6b-XQg7tcWaYFyTZt5b2rs-0VJjAwunXZSlXfXyDrOtwUB8ud1lu56P9DU16gwmY64gxjtEhI2dPoZBhJ0xYnRdjZ1dCNWqtQxTrA2kgKoFKnTmrh_cHw-Qwaw:1wbfwf:IU2A-ixOR5gSlJNPXc5laGKcebxxLl8ggleQB1naiN8','2026-07-06 14:48:17.348447'),('tk1szb4lzln4ilo8ufn24ghqiky7ktv7','.eJxVi0kKwzAMAP-icwmW40XOsdB3GMmWcehCaJJT6d9LIYf2ODPMCzLvW8_7qs88V5jAwenXCZerPr6Bl2U4aB0ud55v56P9DZ3XDhPUQE5QkLSholqJOKaA1KhG16IVtRxtNcWxmuJMEFs8UiI03o82wfsDBXUxBA:1wc3kn:r4-2F1A-2Feklp7r-iPpB_8TyH2rC3aXfPsHsabB4LU','2026-07-07 16:13:37.373991');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrada`
--

DROP TABLE IF EXISTS `entrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrada` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` datetime(6) NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `observaciones` longtext,
  `estado` tinyint(1) NOT NULL,
  `anulado` tinyint(1) NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `producto_id` bigint NOT NULL,
  `proveedor_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `entrada_usuario_id_180cfbb0_fk_usuarios_id` (`usuario_id`),
  KEY `entrada_producto_id_6810d15d_fk_productos_id` (`producto_id`),
  KEY `entrada_proveedor_id_07c29e94_fk_proveedor_id` (`proveedor_id`),
  CONSTRAINT `entrada_producto_id_6810d15d_fk_productos_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `entrada_proveedor_id_07c29e94_fk_proveedor_id` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`),
  CONSTRAINT `entrada_usuario_id_180cfbb0_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrada`
--

LOCK TABLES `entrada` WRITE;
/*!40000 ALTER TABLE `entrada` DISABLE KEYS */;
INSERT INTO `entrada` VALUES (1,'2026-06-13 16:04:42.578358',1,500000.00,500000.00,'',1,0,1,1,NULL),(2,'2026-06-22 15:00:13.986786',12,23000.00,276000.00,'',1,0,3,4,NULL),(3,'2026-06-29 21:56:22.432161',20,380000.00,7600000.00,'Entrada de prueba: 20 Silla Ejecutiva',1,0,5,6,7),(4,'2026-06-29 21:56:22.446178',50,35000.00,1750000.00,'Entrada de prueba: 50 CojÃ­n Decorativo',1,0,5,9,8),(5,'2026-06-29 21:56:22.460545',25,250000.00,6250000.00,'Entrada de prueba: 25 Estante Modular',1,0,5,11,9),(6,'2026-06-30 02:28:56.008603',1,400000.00,400000.00,'',1,0,1,10,NULL);
/*!40000 ALTER TABLE `entrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_historialchat`
--

DROP TABLE IF EXISTS `ia_historialchat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ia_historialchat` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mensaje_usuario` longtext NOT NULL,
  `respuesta_ia` longtext NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ia_historialchat_usuario_id_9df81953_fk_usuarios_id` (`usuario_id`),
  CONSTRAINT `ia_historialchat_usuario_id_9df81953_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_historialchat`
--

LOCK TABLES `ia_historialchat` WRITE;
/*!40000 ALTER TABLE `ia_historialchat` DISABLE KEYS */;
INSERT INTO `ia_historialchat` VALUES (108,'dime que productos hay','Amigo! En la base de datos de BEDCOM, tenemos los siguientes productos:\n\nâ€¢ **Base Doble Moderna**\nâ€¢ **Espaldar Capitoneado Plano King**\nâ€¢ **Base Cama BaÃºl Dividida Queen**\nâ€¢ **Base Cama Nido Duplex**\nâ€¢ **Espalder Lineal Banana King con IluminaciÃ³n LED**\nâ€¢ **Silla Ejecutiva**\nâ€¢ **Mesa de Centro**\nâ€¢ **SofÃ¡ 3 Puestos**\nâ€¢ **CojÃ­n Decorativo**\nâ€¢ **Closet 2 Puertas**\nâ€¢ **Estante Modular**\n\nÂ¿En quÃ© puedo ayudarte con estos productos?','2026-06-30 12:40:17.025085',1),(109,'dime los proveedores','Amigo! En la base de datos de BEDCOM, tenemos los siguientes proveedores:\n\nâ€¢ **Maderas y Triplex del Oriente** (telÃ©fono: 3125224799, direcciÃ³n: New Sogayork)\nâ€¢ **Todo Herrajes y Grapas Industriales** (telÃ©fono: 3117894561, direcciÃ³n: Carrera 11 # 22-10)\nâ€¢ **Distribuidora del Sur** (telÃ©fono: 3005123456, direcciÃ³n: Cra 50 #20-30, MedellÃ­n)\nâ€¢ **Suministros Industriales SAS** (telÃ©fono: 3016987452, direcciÃ³n: Av. Siempre Viva #123, BogotÃ¡)\nâ€¢ **Maderas y Acabados LTDA** (telÃ©fono: 3154789652, direcciÃ³n: Calle 80 #45-12, Barranquilla)\n\nÂ¿En quÃ© puedo ayudarte con estos proveedores?','2026-06-30 12:44:40.769881',1),(110,'listame los insumos','Amigo! En la base de datos de BEDCOM, tenemos los siguientes insumos:\n\nâ€¢ **Madera Maciza** (cantidad: 48, precio: $150000.00, categorÃ­a: Maderas y Derivados, proveedor: Maderas y Triplex del Oriente)\nâ€¢ **ListÃ³n de Pino Inmunizado 2x3** (cantidad: 25, precio: $14500.00, categorÃ­a: Maderas y Derivados, proveedor: Maderas y Triplex del Oriente)\nâ€¢ **Tela Lino Pesado Premium** (cantidad: 50, precio: $22000.00, categorÃ­a: Telas Externas, proveedor: DistriTelas y Tapiceria Lafayette SA)\nâ€¢ **Tela Cambre Negro 70g** (cantidad: 25, precio: $3500.00, categorÃ­a: Telas de Soporte, proveedor: DistriTelas y Tapiceria Lafayette SA)\nâ€¢ **LÃ¡mina de Espuma Rosada** (cantidad: 5, precio: $38000.00, categorÃ­a: Espumas y Rellenos, proveedor: Industrias PentaEspumas del Centro)\nâ€¢ **Grapas Industriales Calibre 8010** (cantidad: 3, precio: $28000.00, categorÃ­a: FijaciÃ³n RÃ¡pida, proveedor: Todo Herrajes y Grapas Industriales)\nâ€¢ **PistÃ³n HidrÃ¡ulico a Gas 1000N** (cantidad: 25, precio: $22500.00, categorÃ­a: Sistemas MecÃ¡nicos, proveedor: Soluciones Mecanicas y Adhesivos Cucuta)\nâ€¢ **Pegante de Contacto BÃ³xer Industrial** (cantidad: 12, precio: $65000.00, categorÃ­a: QuÃ­micos y Pegantes, proveedor: Soluciones Mecanicas y Adhesivos Cucuta)\nâ€¢ **Tela Microfibra** (cantidad: 100, precio: $15000.00, categorÃ­a: Telas, proveedor: Distribuidora del Sur)\nâ€¢ **Espuma D-30** (cantidad: 50, precio: $28000.00, categorÃ­a: Telas, proveedor: Distribuidora del Sur)\nâ€¢ **Tornillos 2\"** (cantidad: 476, precio: $2500.00, categorÃ­a: Herrajes, proveedor: Suministros Industriales SAS)\nâ€¢ **Bisagras** (cantidad: 194, precio: $3800.00, categorÃ­a: Herrajes, proveedor: Suministros Industriales SAS)\nâ€¢ **LÃ¡mina Melamina** (cantidad: 76, precio: $45000.00, categorÃ­a: Herrajes, proveedor: Maderas y Acabados LTDA)\n\nÂ¿En quÃ© puedo ayudarte con estos insumos?','2026-06-30 14:16:09.368998',1),(111,'quien es mbappe?','Amigo! Soy Luna, la asistente virtual de BEDCOM, no tengo nada que ver con el fÃºtbol ni con MbappÃ©. Â¡No puedo responder a eso! Solo soy un asistente de la base de datos de BEDCOM. Â¿En quÃ© puedo ayudarte con el inventario o los mÃ³dulos del sistema?','2026-06-30 14:21:15.236203',1),(112,'cual es la ultima venta?','Amigo! En la base de datos de BEDCOM, la Ãºltima venta registrada fue:\n\nâ€¢ **Pedido #5**: Silla Ejecutiva (1 unidad) - Total: $120000.00 - Abono: $0.00 - Fecha de entrega: 2023-02-15 - Estado: Completado\n\nÂ¿En quÃ© puedo ayudarte con esta venta o con cualquier otro tema relacionado con BEDCOM?','2026-06-30 14:22:11.407866',1),(113,'listame los clientes','Amigo! En la base de datos de BEDCOM, tenemos los siguientes clientes:\n\nâ€¢ **Pedro Paramo** (telÃ©fono: 5656565656, direcciÃ³n: Calle 343 #3, correo electrÃ³nico: sin correo, tipo de cliente: normal)\nâ€¢ **Mario Zapata** (telÃ©fono: 4546546465, direcciÃ³n: Calle 45 #45, correo electrÃ³nico: mario@gmail.com, tipo de cliente: especial)\nâ€¢ **Carlos Alberto GÃ³mez Restrepo** (telÃ©fono: 3154567890, direcciÃ³n: Calle 26 #45-12, BogotÃ¡, correo electrÃ³nico: sin correo, tipo de cliente: normal)\nâ€¢ **MarÃ­a Camila Torres Rojas** (telÃ©fono: 3209876543, direcciÃ³n: Carrera 10 #15-34, Tunja, correo electrÃ³nico: matorres@outlook.com, tipo de cliente: especial)\nâ€¢ **Carlos MÃ©ndez** (telÃ©fono: 3001112233, direcciÃ³n: Calle 45 #22-11, MedellÃ­n, correo electrÃ³nico: carlos.mÃ©ndez@email.com, tipo de cliente: normal)\nâ€¢ **MarÃ­a GarcÃ­a** (telÃ©fono: 3105544332, direcciÃ³n: Cra 72 #33-10, BogotÃ¡, correo electrÃ³nico: marÃ­a.garcÃ­a@email.com, tipo de cliente: especial)\nâ€¢ **Pedro RamÃ­rez** (telÃ©fono: 3209876543, direcciÃ³n: Av. Nutibara #12-34, MedellÃ­n, correo electrÃ³nico: pedro.ramÃ­rez@email.com, tipo de cliente: normal)\nâ€¢ **Laura Castillo** (telÃ©fono: 3156789012, direcciÃ³n: Calle 10 #5-67, Cali, correo electrÃ³nico: laura.castillo@email.com, tipo de cliente: especial)\n\nÂ¿En quÃ© puedo ayudarte con estos clientes o con cualquier otro tema relacionado con BEDCOM?','2026-06-30 14:26:06.900981',1),(114,'Tipo de uso que le asignamos.','Amigo! En la base de datos de BEDCOM, los tipos de uso que le asignamos a nuestros clientes son:\n\nâ€¢ **Normal**: Clientes que realizan compras normales y no tienen necesidades especiales.\nâ€¢ **Especial**: Clientes que requieren atenciÃ³n especializada o tienen necesidades especÃ­ficas.\n\nÂ¿En quÃ© puedo ayudarte con estos tipos de uso o con cualquier otro tema relacionado con BEDCOM?','2026-06-30 16:49:00.042537',1),(115,'hay despachos?','Amigo! En la base de datos de BEDCOM, sÃ­ hay despachos. Actualmente, tenemos los siguientes despachos:\n\nâ€¢ **Despacho nÃºmero 5**: Pedido nÃºmero 7, estado en_ruta, fecha 2026-06-29, guÃ­a GUI-95316\nâ€¢ **Despacho nÃºmero 4**: Pedido nÃºmero 4, estado pendiente, fecha 2026-06-29, guÃ­a GUI-53808\nâ€¢ **Despacho nÃºmero 2**: Pedido nÃºmero 2, estado pendiente, fecha 2026-06-22, guÃ­a W231H6\n\nÂ¿En quÃ© puedo ayudarte con estos despachos o con cualquier otro tema relacionado con BEDCOM?','2026-06-30 17:03:52.865373',1);
/*!40000 ALTER TABLE `ia_historialchat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumo`
--

DROP TABLE IF EXISTS `insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` longtext,
  `cantidad` int NOT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `id_categoria_id` bigint NOT NULL,
  `id_proveedor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `insumo_id_categoria_id_92e3186c_fk_categorias_id` (`id_categoria_id`),
  KEY `insumo_id_proveedor_id_12db000d_fk_proveedor_id` (`id_proveedor_id`),
  CONSTRAINT `insumo_id_categoria_id_92e3186c_fk_categorias_id` FOREIGN KEY (`id_categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `insumo_id_proveedor_id_12db000d_fk_proveedor_id` FOREIGN KEY (`id_proveedor_id`) REFERENCES `proveedor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumo`
--

LOCK TABLES `insumo` WRITE;
/*!40000 ALTER TABLE `insumo` DISABLE KEYS */;
INSERT INTO `insumo` VALUES (1,'Madera Maciza','Principalmente maderas secas y tratadas contra plagas inmunizadas.',48,'kg',150000.00,'Inactivo',5,1),(2,'ListÃ³n de Pino Inmunizado 2x3','ListÃ³n de madera de pino cepillada, secada al horno y con tratamiento quÃ­mico contra plagas. Longitud de 3 metros. Ideal para el esqueleto de bases y cabeceros.',700,'und',14500.00,'Activo',5,1),(3,'Tela Lino Pesado Premium','Tela de alto trÃ¡fico con texturizado tipo lino y reverso reforzado. Utilizada para el acabado estÃ©tico exterior de espaldares y bases divididas.',700,'m',22000.00,'Activo',7,3),(4,'Tela Cambre Negro 70g','Tela no tejida cambrefriselina de 70 gramos. Se utiliza para el tapizado de la base inferior la parte que da contra el piso y el respaldo posterior de los cabeceros.',700,'m',3500.00,'Activo',8,3),(5,'LÃ¡mina de Espuma Rosada','Espuma de poliuretano de densidad 26, dimensiones 1.90m x 1.40m con grosor de 2cm. Perfecta para acolchar los laterales de las bases camas antes de poner la tela.',700,'und',38000.00,'Activo',9,4),(6,'PistÃ³n HidrÃ¡ulico a Gas 1000N','Amortiguador neumÃ¡tico de fuerza 1000 Newtons para el sistema de elevaciÃ³n en camas tipo baÃºl tamaÃ±o Matrimonial o Queen.',700,'und',22500.00,'Activo',11,6),(7,'Pegante de Contacto BÃ³xer Industrial','Pegante de alta fuerza inicial para la uniÃ³n firme de espumas sobre la estructura de madera o MDF.',699,'gal',65000.00,'Activo',14,6),(8,'Grapas Industriales Calibre 8010','Caja de grapas de acero galvanizado calibre 80, longitud de pata de 10mm. Ideal para fijaciÃ³n neumÃ¡tica de las telas y el cambre a la madera.',700,'caja',28000.00,'Activo',13,5),(9,'Tornillos 2\"',NULL,476,'unidades',2500.00,'Activo',19,8),(10,'Bisagras','',700,'und',3800.00,'Activo',19,8),(11,'Tela Microfibra',NULL,100,'metros',15000.00,'Activo',20,7),(12,'Espuma D-30','',700,'rollo',28000.00,'Activo',20,7),(13,'LÃ¡mina Melamina','',700,'m',45000.00,'Activo',19,9);
/*!40000 ALTER TABLE `insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimientos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `descripcion_falla` longtext,
  `estado_reparacion` varchar(20) NOT NULL,
  `pedido_id` bigint DEFAULT NULL,
  `producto_id` bigint DEFAULT NULL,
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `garantia_pedido_id_f6fd616f_fk_pedido_id` (`pedido_id`),
  KEY `garantia_producto_id_da48ce24_fk_productos_id` (`producto_id`),
  CONSTRAINT `garantia_pedido_id_f6fd616f_fk_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`),
  CONSTRAINT `garantia_producto_id_da48ce24_fk_productos_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimientos`
--

LOCK TABLES `mantenimientos` WRITE;
/*!40000 ALTER TABLE `mantenimientos` DISABLE KEYS */;
INSERT INTO `mantenimientos` VALUES (1,'2026-06-22','pintura rallada','recibida',2,1,1),(2,'2026-06-22','piza suleta','recibida',2,2,1),(3,'2026-06-10','Brazo derecho suelto','recibida',NULL,6,1),(4,'2026-06-19','Resorte saltado en el asiento','en_reparacion',NULL,8,1),(5,'2026-06-16','RayÃ³n profundo en la superficie','reparada',NULL,7,1),(6,'2026-06-30','pintura','entregada',9,4,1);
/*!40000 ALTER TABLE `mantenimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo` varchar(30) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` longtext NOT NULL,
  `leida` tinyint(1) NOT NULL,
  `fecha_notif` datetime(6) NOT NULL,
  `target_id` int unsigned DEFAULT NULL,
  `data_json` json NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_user_id_a5cc14eb_fk_usuarios_id` (`user_id`),
  KEY `notificacio_leida_3ab474_idx` (`leida`,`fecha_notif`),
  CONSTRAINT `notificaciones_user_id_a5cc14eb_fk_usuarios_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `notificaciones_chk_1` CHECK ((`target_id` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (53,'sin_bom','Producto sin BOM: Espaldar Capitoneado Plano King','Espaldar Capitoneado Plano King no tiene receta de materiales asignada',0,'2026-06-29 18:47:15.165219',2,'{}',1),(54,'sin_bom','Producto sin BOM: Espalder Lineal Banana King con IluminaciÃ³n LED','Espalder Lineal Banana King con IluminaciÃ³n LED no tiene receta de materiales asignada',0,'2026-06-29 18:47:15.172678',5,'{}',1),(57,'bajo_stock_producto','Stock bajo','Quedan pocas unidades de CojÃ­n Decorativo',0,'2026-06-29 21:56:22.580455',NULL,'{}',5),(58,'calendario_hoy','Evento hoy','Tienes reuniÃ³n de producciÃ³n programada',0,'2026-06-29 21:56:22.588911',NULL,'{}',5),(59,'mantenimiento_nueva','Nuevo mantenimiento','Se registrÃ³ un mantenimiento pendiente',0,'2026-06-29 21:56:22.598099',NULL,'{}',5),(61,'pendido_despacho','Despacho pendiente #4','Pedido 4 de Carlos MÃ©ndez',0,'2026-06-29 21:56:45.611986',4,'{}',1),(62,'sin_bom','Producto sin BOM: Mesa de Centro','Mesa de Centro no tiene receta de materiales asignada',0,'2026-06-29 21:56:45.648490',7,'{}',1),(63,'sin_bom','Producto sin BOM: CojÃ­n Decorativo','CojÃ­n Decorativo no tiene receta de materiales asignada',0,'2026-06-29 21:56:45.658662',9,'{}',1),(64,'sin_bom','Producto sin BOM: Estante Modular','Estante Modular no tiene receta de materiales asignada',0,'2026-06-29 21:56:45.668966',11,'{}',1),(65,'pago_pendiente','Pago pendiente pedido #5','Cliente MarÃ­a GarcÃ­a: $1030000.00',0,'2026-06-29 21:56:45.686523',5,'{}',1),(66,'pago_pendiente','Pago pendiente pedido #6','Cliente Pedro RamÃ­rez: $1030000.00',0,'2026-06-29 21:56:45.699223',6,'{}',1),(68,'calendario_manaÃ±a','Evento MAÃ‘ANA: RevisiÃ³n de nÃ³mina','Preparar: RevisiÃ³n de nÃ³mina - 09:00:00',1,'2026-06-30 10:39:38.508819',10,'{}',1),(70,'bajo_stock_producto','Bajo stock: Espaldar Capitoneado Plano King','Producto Espaldar Capitoneado Plano King solo 4 unidades',0,'2026-06-30 14:48:37.975287',2,'{\"stock\": 4}',1),(71,'pago_pendiente','Pago pendiente pedido #8','Cliente MarÃ­a Camila Torres Rojas: $225000.00',0,'2026-06-30 14:48:38.015792',8,'{}',1),(81,'pago_pendiente','Pago pendiente pedido #10','Cliente David Mendivelso: $13000.00',0,'2026-06-30 17:06:15.812984',10,'{}',1),(82,'pendido_despacho','Despacho pendiente #6','Pedido 9 de David Mendivelso',0,'2026-06-30 17:26:02.434077',6,'{}',1),(83,'mantenimiento_nueva','Nuevo Mantenimiento Registrado','Mantenimiento #6 registrado para el producto Base Cama Nido Duplex.',0,'2026-06-30 17:31:18.764761',6,'{}',1);
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_pago` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `pedido_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pagos_pedido_id_3433cb91_fk_pedido_id` (`pedido_id`),
  CONSTRAINT `pagos_pedido_id_3433cb91_fk_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (4,'2026-06-22',715000.00,1,2),(6,'2026-06-22',715000.00,1,2),(8,'2026-06-29',50000.00,1,5),(9,'2026-06-29',1080000.00,1,6),(10,'2026-06-30',225000.00,1,8),(11,'2026-06-30',850000.00,1,9),(12,'2026-06-30',13000.00,1,10),(13,'2026-06-30',850000.00,1,9);
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` datetime(6) NOT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `fecha_limite_pago` date DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `abono` decimal(12,2) DEFAULT NULL,
  `cliente_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_cliente_id_e6353bb4_fk_clientes_id` (`cliente_id`),
  CONSTRAINT `pedido_cliente_id_e6353bb4_fk_clientes_id` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (2,'2026-06-22 14:55:11.657971','2026-06-24',NULL,'Completado',1430000.00,1430000.00,2),(4,'2026-06-29 21:56:22.168686','2026-07-06',NULL,'Pendiente',1080000.00,NULL,6),(5,'2026-06-29 21:56:22.212240','2026-07-06',NULL,'Pendiente',1080000.00,50000.00,7),(6,'2026-06-29 21:56:22.243441','2026-06-19',NULL,'Pendiente',1080000.00,50000.00,8),(7,'2026-06-29 21:56:22.269223','2026-07-06',NULL,'Pendiente',1080000.00,NULL,9),(8,'2026-06-30 14:48:31.216450','2026-07-11',NULL,'En FabricaciÃ³n',450000.00,225000.00,5),(9,'2026-06-30 14:53:34.721981','2026-07-10',NULL,'Despachado',1700000.00,1700000.00,10),(10,'2026-06-30 17:06:07.860223','2026-07-09',NULL,'En FabricaciÃ³n',26000.00,13000.00,10);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_insumo`
--

DROP TABLE IF EXISTS `producto_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_insumo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `unidad_medida` varchar(50) NOT NULL,
  `insumo_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `producto_insumo_producto_id_insumo_id_2309496f_uniq` (`producto_id`,`insumo_id`),
  KEY `producto_insumo_insumo_id_a8fb8418_fk_insumo_id` (`insumo_id`),
  CONSTRAINT `producto_insumo_insumo_id_a8fb8418_fk_insumo_id` FOREIGN KEY (`insumo_id`) REFERENCES `insumo` (`id`),
  CONSTRAINT `producto_insumo_producto_id_1d231c9d_fk_productos_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_insumo`
--

LOCK TABLES `producto_insumo` WRITE;
/*!40000 ALTER TABLE `producto_insumo` DISABLE KEYS */;
INSERT INTO `producto_insumo` VALUES (1,1,'und',1,1),(9,1,'und',5,3),(10,1,'g',1,3),(11,16,'und',2,4),(12,2,'und',5,4),(13,4,'m',4,4),(14,1,'lt',7,4),(15,100,'und',8,4),(16,12,'unidades',9,6),(17,2,'metros',11,6),(18,1,'lÃ¡minas',12,6),(19,8,'metros',11,8),(20,3,'lÃ¡minas',12,8),(21,4,'lÃ¡minas',13,10),(22,6,'unidades',10,10),(23,24,'unidades',9,10);
/*!40000 ALTER TABLE `producto_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` longtext NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL,
  `categoria_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productos_categoria_id_92c5ef6b_fk_categorias_id` (`categoria_id`),
  CONSTRAINT `productos_categoria_id_92c5ef6b_fk_categorias_id` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Base Doble Moderna','Cama cama cama',26000.00,23,'',1,1),(2,'Espaldar Capitoneado Plano King','Espaldar para cama tamaÃ±o King 2.00m x 2.00m, tapizado en tela tipo lino de alta resistencia con diseÃ±o clÃ¡sico capitoneado plano. Estructura interna en madera inmunizada',450000.00,4,'',1,3),(3,'Base Cama BaÃºl Dividida Queen','Base cama funcional tamaÃ±o Queen 1.60m x 1.90m con sistema de apertura tipo baÃºl y pistones hidrÃ¡ulicos. Estructura dividida para facilitar el traslado, tapizada en cuero sintÃ©tico bocati negro y patas metÃ¡licas antideslizantes.',850000.00,7,'productos/descarga_itWDcOS.jpg',1,1),(4,'Base Cama Nido Duplex','Base cama auxiliar ideal para habitaciones de niÃ±os o de visitas. Incluye una estructura principal sencilla y una cama inferior con rodachinas de alta resistencia que se despliega fÃ¡cilmente. Tapizada en tela microfibra antifluido gris.',580000.00,26,'',1,15),(5,'Espalder Lineal Banana King con IluminaciÃ³n LED','Cabecero de diseÃ±o moderno con lÃ­neas verticales Estilo Banana. Incluye sistema de anclaje flotante a la pared y franjas laterales con iluminaciÃ³n LED cÃ¡lida integrada para lectura. Tapizado en tela tipo Velvet terciopelo azul turquÃ­.',620000.00,10,'',1,3),(6,'Silla Ejecutiva','Silla Ejecutiva de alta calidad',450000.00,35,'',1,16),(7,'Mesa de Centro','Mesa de Centro de alta calidad',680000.00,8,'',1,16),(8,'SofÃ¡ 3 Puestos','SofÃ¡ 3 Puestos de alta calidad',1200000.00,6,'',1,17),(9,'CojÃ­n Decorativo','CojÃ­n Decorativo de alta calidad',45000.00,90,'',1,17),(10,'Closet 2 Puertas','Closet 2 Puertas de alta calidad',950000.00,7,'',1,18),(11,'Estante Modular','Estante Modular de alta calidad',320000.00,37,'',1,18);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Maderas y Triplex del Oriente','3125224799','New Sogayork','Listones de pino inmunizado, lÃ¡minas de MDF, aglomerados y MDP para las estructuras.','',1),(2,'vnbvjhvhjvh','7987897897','jbhjbhjbhjb','tyuyuiufghghg','',0),(3,'DistriTelas y Tapiceria Lafayette SA','3158765432','Av. AmÃ©ricas # 50-30','Telas externas lino, terciopelo, cuerinas, microfibras y telas de soporte cambre, cover antideslizante.','',1),(4,'Industrias PentaEspumas del Centro','3204561234','Carrera 42 # 10-55','LÃ¡minas de espuma de alta densidad D23, D26, D30, guata y algodÃ³n laminado para el acolchado de espaldares.','',1),(5,'Todo Herrajes y Grapas Industriales','3117894561','Carrera 11 # 22-10','Grapas 8010, tornillerÃ­a, Ã¡ngulos metÃ¡licos de esquina, platinas de anclaje y patas metÃ¡licasmadera.','',1),(6,'Soluciones Mecanicas y Adhesivos Cucuta','3186549872','Av. 5ta # 2-88, Barrio Blanco','Pistones hidrÃ¡ulicos para base camas baÃºl, pegante de contacto bÃ³xer industrial y pegante en spray.','',1),(7,'Distribuidora del Sur','3005123456','Cra 50 #20-30, MedellÃ­n','Proveedor Distribuidora del Sur','',1),(8,'Suministros Industriales SAS','3016987452','Av. Siempre Viva #123, BogotÃ¡','Proveedor Suministros Industriales SAS','',1),(9,'Maderas y Acabados LTDA','3154789652','Calle 80 #45-12, Barranquilla','Proveedor Maderas y Acabados LTDA','',1);
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor_insumo`
--

DROP TABLE IF EXISTS `proveedor_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor_insumo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_suministro` date NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unidad` decimal(12,2) NOT NULL,
  `insumo_id` bigint NOT NULL,
  `proveedor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proveedor_insumo_proveedor_id_insumo_id_8d8d81b9_uniq` (`proveedor_id`,`insumo_id`),
  KEY `proveedor_insumo_insumo_id_0a027f32_fk_insumo_id` (`insumo_id`),
  CONSTRAINT `proveedor_insumo_insumo_id_0a027f32_fk_insumo_id` FOREIGN KEY (`insumo_id`) REFERENCES `insumo` (`id`),
  CONSTRAINT `proveedor_insumo_proveedor_id_b69b69f2_fk_proveedor_id` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor_insumo`
--

LOCK TABLES `proveedor_insumo` WRITE;
/*!40000 ALTER TABLE `proveedor_insumo` DISABLE KEYS */;
INSERT INTO `proveedor_insumo` VALUES (1,'2026-05-03',1000,2200.00,9,8),(2,'2026-05-20',200,14000.00,11,7),(3,'2026-05-05',100,42000.00,13,9);
/*!40000 ALTER TABLE `proveedor_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reporte_usuario_id_7d124763_fk_usuarios_id` (`usuario_id`),
  CONSTRAINT `reporte_usuario_id_7d124763_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
INSERT INTO `reporte` VALUES (1,'inventario','2026-06-29',5);
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respaldos`
--

DROP TABLE IF EXISTS `respaldos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respaldos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` datetime(6) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `tipo_respaldo` varchar(20) NOT NULL,
  `descripcion` longtext,
  `archivo` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respaldos`
--

LOCK TABLES `respaldos` WRITE;
/*!40000 ALTER TABLE `respaldos` DISABLE KEYS */;
INSERT INTO `respaldos` VALUES (2,'2026-06-30 12:52:20.867405','D4V1DMC','completo','Backup MySQL generado','respaldos_sql\\backup_20260630_075220.sql',1);
/*!40000 ALTER TABLE `respaldos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salida_producto`
--

DROP TABLE IF EXISTS `salida_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salida_producto` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `fecha` date NOT NULL,
  `motivo` longtext NOT NULL,
  `responsable` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `id_producto_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `salida_producto_id_producto_id_19c8767a_fk_productos_id` (`id_producto_id`),
  CONSTRAINT `salida_producto_id_producto_id_19c8767a_fk_productos_id` FOREIGN KEY (`id_producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salida_producto`
--

LOCK TABLES `salida_producto` WRITE;
/*!40000 ALTER TABLE `salida_producto` DISABLE KEYS */;
INSERT INTO `salida_producto` VALUES (1,5,'2026-06-19','ihihhjkhjk','D4V1DMC',0,1),(2,1,'2026-06-22','venta individual','D4V1DMC',1,1),(3,2,'2026-06-24','Venta directa mostrador','AlmacÃ©n Pruebas',1,6),(4,10,'2026-06-26','Pedido cliente corporativo','AlmacÃ©n Pruebas',1,9),(5,1,'2026-06-30','daÃ±o de tela','Sofia',0,3);
/*!40000 ALTER TABLE `salida_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervision`
--

DROP TABLE IF EXISTS `supervision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervision` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `descripcion` longtext NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supervision_usuario_id_947bfdcd_fk_usuarios_id` (`usuario_id`),
  CONSTRAINT `supervision_usuario_id_947bfdcd_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervision`
--

LOCK TABLES `supervision` WRITE;
/*!40000 ALTER TABLE `supervision` DISABLE KEYS */;
INSERT INTO `supervision` VALUES (1,'2026-06-29','SupervisiÃ³n general de prueba',5);
/*!40000 ALTER TABLE `supervision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `foto_usua` varchar(100) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'pbkdf2_sha256$1200000$lzhTUxIVUCIgwf9gUtv0wA$k2DYeFDiHKoNSiAVQaWa9zcnw+dC+97nlAtNFlts0LM=','2026-06-30 17:18:35.791169',0,'D4V1DMC','Edgar David','Mendivelso Cuy',0,1,'2026-05-22 16:30:54.378239','1057979942','administrador','Activo','','3223743761','edgarmencuy@gmail.com'),(2,'pbkdf2_sha256$1200000$pnd80ki4hRzNKdNKnb4eK8$G3Gsn2EIXG//uXlj0Us3IyHRATNcUIacoY3l8mWQ5Xc=','2026-06-19 15:56:39.087104',0,'D4V1D','David','Cuy',0,1,'2026-06-19 12:55:51.493621','9784984154','administrador','Activo','','8521111235','d4v1dmecu@gmail.com'),(3,'pbkdf2_sha256$1200000$YjDXFuTwMeORC5jepIhAYh$TWx/JQIKKkUasDNazptHrkffEmzoTCgMCJU5Jtf2+OQ=','2026-06-23 00:39:51.720115',0,'pedro','paramo','pedro',0,1,'2026-06-22 14:48:08.335778','1255665993','administrador','Activo','','3266598585','benitezsanabriajuan@gmail.com'),(4,'pbkdf2_sha256$1200000$pOOMiVSUdRiekceU5tmEa7$jWlyCNDHro1jxzoF9OVOqvW+waIEBXlqf4Sj2+z0l1o=','2026-06-23 16:13:37.369244',0,'Sofia','Sofia','Quimbaya',0,1,'2026-06-22 15:14:54.962242','1069128522','administrador','Activo','','3138341520','sofiaquimbayita@gmail.com'),(5,'pbkdf2_sha256$1200000$sHXne3DiJ9zbNROFm6fnf9$vIwqEWh7OElv1LUksIR3O6XWe0lra+uW89S3WjA5QgY=',NULL,1,'admin','','',1,1,'2026-06-29 21:56:19.600561','12345678','Administrador','Activo','',NULL,'admin@bedcom.com');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_groups`
--

DROP TABLE IF EXISTS `usuarios_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_groups_usuario_id_group_id_a66c5ef3_uniq` (`usuario_id`,`group_id`),
  KEY `usuarios_groups_group_id_18c61092_fk_auth_group_id` (`group_id`),
  CONSTRAINT `usuarios_groups_group_id_18c61092_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `usuarios_groups_usuario_id_1132ca50_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_groups`
--

LOCK TABLES `usuarios_groups` WRITE;
/*!40000 ALTER TABLE `usuarios_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_user_permissions`
--

DROP TABLE IF EXISTS `usuarios_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_user_permissions_usuario_id_permission_id_474b33a5_uniq` (`usuario_id`,`permission_id`),
  KEY `usuarios_user_permis_permission_id_af615ca1_fk_auth_perm` (`permission_id`),
  CONSTRAINT `usuarios_user_permis_permission_id_af615ca1_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `usuarios_user_permissions_usuario_id_232fd58d_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_user_permissions`
--

LOCK TABLES `usuarios_user_permissions` WRITE;
/*!40000 ALTER TABLE `usuarios_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webpush_group`
--

DROP TABLE IF EXISTS `webpush_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webpush_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webpush_group`
--

LOCK TABLES `webpush_group` WRITE;
/*!40000 ALTER TABLE `webpush_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `webpush_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webpush_pushinformation`
--

DROP TABLE IF EXISTS `webpush_pushinformation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webpush_pushinformation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `subscription_id` int NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `webpush_pushinformation_user_id_5e083b7f_fk_usuarios_id` (`user_id`),
  KEY `webpush_pushinformation_group_id_262dcc9a_fk` (`group_id`),
  KEY `webpush_pushinformation_subscription_id_7989aa34_fk` (`subscription_id`),
  CONSTRAINT `webpush_pushinformation_group_id_262dcc9a_fk` FOREIGN KEY (`group_id`) REFERENCES `webpush_group` (`id`),
  CONSTRAINT `webpush_pushinformation_subscription_id_7989aa34_fk` FOREIGN KEY (`subscription_id`) REFERENCES `webpush_subscriptioninfo` (`id`),
  CONSTRAINT `webpush_pushinformation_user_id_5e083b7f_fk_usuarios_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webpush_pushinformation`
--

LOCK TABLES `webpush_pushinformation` WRITE;
/*!40000 ALTER TABLE `webpush_pushinformation` DISABLE KEYS */;
/*!40000 ALTER TABLE `webpush_pushinformation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webpush_subscriptioninfo`
--

DROP TABLE IF EXISTS `webpush_subscriptioninfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webpush_subscriptioninfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `browser` varchar(100) NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `auth` varchar(100) NOT NULL,
  `p256dh` varchar(100) NOT NULL,
  `user_agent` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webpush_subscriptioninfo`
--

LOCK TABLES `webpush_subscriptioninfo` WRITE;
/*!40000 ALTER TABLE `webpush_subscriptioninfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `webpush_subscriptioninfo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-30 12:33:02
