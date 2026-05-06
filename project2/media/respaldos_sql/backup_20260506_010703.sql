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
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add Evento',7,'add_calendario'),(22,'Can change Evento',7,'change_calendario'),(23,'Can delete Evento',7,'delete_calendario'),(24,'Can view Evento',7,'view_calendario'),(25,'Can add CategorÃ­a',8,'add_categoria'),(26,'Can change CategorÃ­a',8,'change_categoria'),(27,'Can delete CategorÃ­a',8,'delete_categoria'),(28,'Can view CategorÃ­a',8,'view_categoria'),(29,'Can add Cliente',9,'add_cliente'),(30,'Can change Cliente',9,'change_cliente'),(31,'Can delete Cliente',9,'delete_cliente'),(32,'Can view Cliente',9,'view_cliente'),(33,'Can add Proveedor',21,'add_proveedor'),(34,'Can change Proveedor',21,'change_proveedor'),(35,'Can delete Proveedor',21,'delete_proveedor'),(36,'Can view Proveedor',21,'view_proveedor'),(37,'Can add Respaldo',23,'add_respaldo'),(38,'Can change Respaldo',23,'change_respaldo'),(39,'Can delete Respaldo',23,'delete_respaldo'),(40,'Can view Respaldo',23,'view_respaldo'),(41,'Can add usuario',26,'add_usuario'),(42,'Can change usuario',26,'change_usuario'),(43,'Can delete usuario',26,'delete_usuario'),(44,'Can view usuario',26,'view_usuario'),(45,'Can add Historial de AcciÃ³n',14,'add_historial_acciones'),(46,'Can change Historial de AcciÃ³n',14,'change_historial_acciones'),(47,'Can delete Historial de AcciÃ³n',14,'delete_historial_acciones'),(48,'Can view Historial de AcciÃ³n',14,'view_historial_acciones'),(49,'Can add Insumo',15,'add_insumo'),(50,'Can change Insumo',15,'change_insumo'),(51,'Can delete Insumo',15,'delete_insumo'),(52,'Can view Insumo',15,'view_insumo'),(53,'Can add Pedido',19,'add_pedido'),(54,'Can change Pedido',19,'change_pedido'),(55,'Can delete Pedido',19,'delete_pedido'),(56,'Can view Pedido',19,'view_pedido'),(57,'Can add pago',18,'add_pago'),(58,'Can change pago',18,'change_pago'),(59,'Can delete pago',18,'delete_pago'),(60,'Can view pago',18,'view_pago'),(61,'Can add Producto',20,'add_producto'),(62,'Can change Producto',20,'change_producto'),(63,'Can delete Producto',20,'delete_producto'),(64,'Can view Producto',20,'view_producto'),(65,'Can add mantenimiento',16,'add_mantenimiento'),(66,'Can change mantenimiento',16,'change_mantenimiento'),(67,'Can delete mantenimiento',16,'delete_mantenimiento'),(68,'Can view mantenimiento',16,'view_mantenimiento'),(69,'Can add detalle_pedido',12,'add_detalle_pedido'),(70,'Can change detalle_pedido',12,'change_detalle_pedido'),(71,'Can delete detalle_pedido',12,'delete_detalle_pedido'),(72,'Can view detalle_pedido',12,'view_detalle_pedido'),(73,'Can add Entrada de Producto',13,'add_entrada'),(74,'Can change Entrada de Producto',13,'change_entrada'),(75,'Can delete Entrada de Producto',13,'delete_entrada'),(76,'Can view Entrada de Producto',13,'view_entrada'),(77,'Can add Reporte',22,'add_reporte'),(78,'Can change Reporte',22,'change_reporte'),(79,'Can delete Reporte',22,'delete_reporte'),(80,'Can view Reporte',22,'view_reporte'),(81,'Can add Salida de Producto',24,'add_salida_producto'),(82,'Can change Salida de Producto',24,'change_salida_producto'),(83,'Can delete Salida de Producto',24,'delete_salida_producto'),(84,'Can view Salida de Producto',24,'view_salida_producto'),(85,'Can add SupervisiÃ³n',25,'add_supervision'),(86,'Can change SupervisiÃ³n',25,'change_supervision'),(87,'Can delete SupervisiÃ³n',25,'delete_supervision'),(88,'Can view SupervisiÃ³n',25,'view_supervision'),(89,'Can add Despacho',11,'add_despacho'),(90,'Can change Despacho',11,'change_despacho'),(91,'Can delete Despacho',11,'delete_despacho'),(92,'Can view Despacho',11,'view_despacho'),(93,'Can add NotificaciÃ³n',17,'add_notificacion'),(94,'Can change NotificaciÃ³n',17,'change_notificacion'),(95,'Can delete NotificaciÃ³n',17,'delete_notificacion'),(96,'Can view NotificaciÃ³n',17,'view_notificacion'),(97,'Can add bom (Estructura de Producto)',6,'add_bom'),(98,'Can change bom (Estructura de Producto)',6,'change_bom'),(99,'Can delete bom (Estructura de Producto)',6,'delete_bom'),(100,'Can view bom (Estructura de Producto)',6,'view_bom'),(101,'Can add compra',10,'add_compra'),(102,'Can change compra',10,'change_compra'),(103,'Can delete compra',10,'delete_compra'),(104,'Can view compra',10,'view_compra'),(105,'Can add access attempt',27,'add_accessattempt'),(106,'Can change access attempt',27,'change_accessattempt'),(107,'Can delete access attempt',27,'delete_accessattempt'),(108,'Can view access attempt',27,'view_accessattempt'),(109,'Can add access log',30,'add_accesslog'),(110,'Can change access log',30,'change_accesslog'),(111,'Can delete access log',30,'delete_accesslog'),(112,'Can view access log',30,'view_accesslog'),(113,'Can add access failure',29,'add_accessfailurelog'),(114,'Can change access failure',29,'change_accessfailurelog'),(115,'Can delete access failure',29,'delete_accessfailurelog'),(116,'Can view access failure',29,'view_accessfailurelog'),(117,'Can add access attempt expiration',28,'add_accessattemptexpiration'),(118,'Can change access attempt expiration',28,'change_accessattemptexpiration'),(119,'Can delete access attempt expiration',28,'delete_accessattemptexpiration'),(120,'Can view access attempt expiration',28,'view_accessattemptexpiration'),(121,'Can add historial chat',31,'add_historialchat'),(122,'Can change historial chat',31,'change_historialchat'),(123,'Can delete historial chat',31,'delete_historialchat'),(124,'Can view historial chat',31,'view_historialchat'),(125,'Can add group',32,'add_group'),(126,'Can change group',32,'change_group'),(127,'Can delete group',32,'delete_group'),(128,'Can view group',32,'view_group'),(129,'Can add push information',33,'add_pushinformation'),(130,'Can change push information',33,'change_pushinformation'),(131,'Can delete push information',33,'delete_pushinformation'),(132,'Can view push information',33,'view_pushinformation'),(133,'Can add subscription info',34,'add_subscriptioninfo'),(134,'Can change subscription info',34,'change_subscriptioninfo'),(135,'Can delete subscription info',34,'delete_subscriptioninfo'),(136,'Can view subscription info',34,'view_subscriptioninfo');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `axes_accesslog`
--

LOCK TABLES `axes_accesslog` WRITE;
/*!40000 ALTER TABLE `axes_accesslog` DISABLE KEYS */;
INSERT INTO `axes_accesslog` VALUES (1,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.118.1 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36','127.0.0.1','luis','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/','2026-05-06 01:05:00.880765',NULL,'0d5eea65c90d62476fdb95ba6feb425b49ec5fe4d1217f93f2d6656c96eb6450'),(2,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.118.1 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36','127.0.0.1','luis','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/','2026-05-06 01:05:02.131165',NULL,'ce9076c06913e4b0d535a6e91e760f724ef9f8304e70ea3b2397f9d49b129b01'),(3,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','127.0.0.1','luis','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/','2026-05-06 02:11:31.042254',NULL,'5a9d6489f7cb3d23a4a8d80179f9b7d99cd1200f435c3b5bfdc146638d98b18f'),(4,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','127.0.0.1','tester','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7','/login/','2026-05-06 04:01:22.022864',NULL,'fbbd52b7156d03f3ac921b7e9e0a868b0e4f49cc5a210e5aedf3b2792edb1613');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendario`
--

LOCK TABLES `calendario` WRITE;
/*!40000 ALTER TABLE `calendario` DISABLE KEYS */;
INSERT INTO `calendario` VALUES (1,'pedro','2026-05-06','21:30:00.000000','inventario','dsfffffffff','manual','pendiente'),(2,'ReuniÃ³n Semanal','2026-05-05','21:20:00.000000','logistica','','automatico','completado'),(3,'pedrdas','2026-05-07','01:06:00.000000','logistica','asddddddd','manual','pendiente');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'sdfsdf','dsfsdfsdfffffffffff','producto',1),(2,'dfsg','dfsgdfsgdsf','producto',1),(3,'rtttttttttttttttttttttt','erttttttttttttttttttttttttttttt','insumo',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'ghjghjgh','544 444 4444','73tyut','benitezsanabriajuan@gmail.com',0,1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `despacho`
--

LOCK TABLES `despacho` WRITE;
/*!40000 ALTER TABLE `despacho` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido`
--

LOCK TABLES `detalle_pedido` WRITE;
/*!40000 ALTER TABLE `detalle_pedido` DISABLE KEYS */;
INSERT INTO `detalle_pedido` VALUES (1,1,234.00,234.00,0,'','',1,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(6,'app','bom'),(7,'app','calendario'),(8,'app','categoria'),(9,'app','cliente'),(10,'app','compra'),(11,'app','despacho'),(12,'app','detalle_pedido'),(13,'app','entrada'),(14,'app','historial_acciones'),(15,'app','insumo'),(16,'app','mantenimiento'),(17,'app','notificacion'),(18,'app','pago'),(19,'app','pedido'),(20,'app','producto'),(21,'app','proveedor'),(22,'app','reporte'),(23,'app','respaldo'),(24,'app','salida_producto'),(25,'app','supervision'),(26,'app','usuario'),(2,'auth','group'),(3,'auth','permission'),(27,'axes','accessattempt'),(28,'axes','accessattemptexpiration'),(29,'axes','accessfailurelog'),(30,'axes','accesslog'),(4,'contenttypes','contenttype'),(31,'ia','historialchat'),(5,'sessions','session'),(32,'webpush','group'),(33,'webpush','pushinformation'),(34,'webpush','subscriptioninfo');
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-05-06 01:04:02.024706'),(2,'contenttypes','0002_remove_content_type_name','2026-05-06 01:04:02.171362'),(3,'auth','0001_initial','2026-05-06 01:04:02.627855'),(4,'auth','0002_alter_permission_name_max_length','2026-05-06 01:04:02.726238'),(5,'auth','0003_alter_user_email_max_length','2026-05-06 01:04:02.735558'),(6,'auth','0004_alter_user_username_opts','2026-05-06 01:04:02.811527'),(7,'auth','0005_alter_user_last_login_null','2026-05-06 01:04:02.820410'),(8,'auth','0006_require_contenttypes_0002','2026-05-06 01:04:02.824919'),(9,'auth','0007_alter_validators_add_error_messages','2026-05-06 01:04:02.833664'),(10,'auth','0008_alter_user_username_max_length','2026-05-06 01:04:02.843568'),(11,'auth','0009_alter_user_last_name_max_length','2026-05-06 01:04:02.854001'),(12,'auth','0010_alter_group_name_max_length','2026-05-06 01:04:02.877259'),(13,'auth','0011_update_proxy_permissions','2026-05-06 01:04:02.888521'),(14,'auth','0012_alter_user_first_name_max_length','2026-05-06 01:04:02.898377'),(15,'app','0001_initial','2026-05-06 01:04:06.449720'),(16,'admin','0001_initial','2026-05-06 01:04:06.681045'),(17,'admin','0002_logentry_remove_auto_add','2026-05-06 01:04:06.697602'),(18,'admin','0003_logentry_add_action_flag_choices','2026-05-06 01:04:06.717539'),(19,'axes','0001_initial','2026-05-06 01:04:06.790041'),(20,'axes','0002_auto_20151217_2044','2026-05-06 01:04:07.012879'),(21,'axes','0003_auto_20160322_0929','2026-05-06 01:04:07.038603'),(22,'axes','0004_auto_20181024_1538','2026-05-06 01:04:07.064897'),(23,'axes','0005_remove_accessattempt_trusted','2026-05-06 01:04:07.140135'),(24,'axes','0006_remove_accesslog_trusted','2026-05-06 01:04:07.225258'),(25,'axes','0007_alter_accessattempt_unique_together','2026-05-06 01:04:07.296627'),(26,'axes','0008_accessfailurelog','2026-05-06 01:04:07.404728'),(27,'axes','0009_add_session_hash','2026-05-06 01:04:07.491724'),(28,'axes','0010_accessattemptexpiration','2026-05-06 01:04:07.591443'),(29,'ia','0001_initial','2026-05-06 01:04:07.753782'),(30,'sessions','0001_initial','2026-05-06 01:04:07.807778'),(31,'webpush','0001_initial','2026-05-06 01:04:08.192614'),(32,'webpush','0002_auto_20190603_0005','2026-05-06 01:04:08.220529'),(33,'webpush','0003_subscriptioninfo_user_agent','2026-05-06 01:04:08.301988'),(34,'webpush','0004_auto_20220831_1500','2026-05-06 01:04:09.003011'),(35,'webpush','0005_auto_20230614_1529','2026-05-06 01:04:09.805961'),(36,'webpush','0006_alter_subscriptioninfo_user_agent','2026-05-06 01:04:09.814307');
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
INSERT INTO `django_session` VALUES ('h6fy85hkv4o47b30r3o2huwmu7p6qyvk','.eJxVi0sKwzAMBe_idQn-xbK7LPQcRrYkHPoh1Mmq9O5NIIt2OW_evFXGdWl57fzKE6mzMur0uxWsN37uAud5OKgP1wdO98vh_oKGvW1vjomCBSrBeFNdYXEpAIzkBMiSjjAiaBTgWKonsB58RCoYkhUhrT5fC1oyEQ:1wKQhA:B-RbfXQ472JmaLPHy67vxwtGS3KaL11Tap-dN9Z1xUI','2026-05-20 01:05:00.938461'),('hikeudk7py80l16p7898sv9xatnp084b','.eJxVi0sKwzAMBe_idQn-xbK7LPQcRrYkHPoh1Mmq9O5NIIt2OW_evFXGdWl57fzKE6mzMur0uxWsN37uAud5OKgP1wdO98vh_oKGvW1vjomCBSrBeFNdYXEpAIzkBMiSjjAiaBTgWKonsB58RCoYkhUhrT5fC1oyEQ:1wKRjX:Y8UCOm-2dljMrUA9PLEAr5ZM6ZE2cNZm_2lLJStwhmI','2026-05-20 02:11:31.064298'),('kiyfp0wedrohtzeex2iz5pi4id9gxwt7','.eJxVi0sKwzAMBe_idQn-xbK7LPQcRrYkHPoh1Mmq9O5NIIt2OW_evFXGdWl57fzKE6mzMur0uxWsN37uAud5OKgP1wdO98vh_oKGvW1vjomCBSrBeFNdYXEpAIzkBMiSjjAiaBTgWKonsB58RCoYkhUhrT5fC1oyEQ:1wKQhC:SX00_5SVtQc8uNR6W9WnWHyUzWiCP5S9jpITPaIU95Q','2026-05-20 01:05:02.142773'),('ozy8lpk5r38pyb2eu99wfxs5b7ajal19','.eJxVy80KwyAQBOB38VyCa3XVHgt9Dll3FUN_CDU5lb57E8ghPc58Mx-VaJlbWnp5p1HURRl1OnaZ-F5eG9A0DXvqw-1J4-O629-hUW_rOkAB4yrnGCx69oEjek2IJFkKZOers2eoYoRRQMfgjEUtKxsKGdT3BwWXMco:1wKTRq:ud_t-prw52muJyNDnxoW-i4lfpLSiLq-ss_PssH_53g','2026-05-20 04:01:22.046571');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrada`
--

LOCK TABLES `entrada` WRITE;
/*!40000 ALTER TABLE `entrada` DISABLE KEYS */;
INSERT INTO `entrada` VALUES (1,'2026-05-06 06:03:45.882875',34,43.00,1462.00,'werwewerwer',1,0,1,2,NULL);
/*!40000 ALTER TABLE `entrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garantia`
--

DROP TABLE IF EXISTS `garantia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garantia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `descripcion_falla` longtext NOT NULL,
  `estado_reparacion` varchar(50) NOT NULL,
  `pedido_id` bigint DEFAULT NULL,
  `producto_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `garantia_pedido_id_f6fd616f_fk_pedido_id` (`pedido_id`),
  KEY `garantia_producto_id_da48ce24_fk_productos_id` (`producto_id`),
  CONSTRAINT `garantia_pedido_id_f6fd616f_fk_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`),
  CONSTRAINT `garantia_producto_id_da48ce24_fk_productos_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garantia`
--

LOCK TABLES `garantia` WRITE;
/*!40000 ALTER TABLE `garantia` DISABLE KEYS */;
/*!40000 ALTER TABLE `garantia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_acciones`
--

DROP TABLE IF EXISTS `historial_acciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_acciones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` datetime(6) NOT NULL,
  `tipo_accion` varchar(20) NOT NULL,
  `modulo` varchar(20) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `detalles` longtext,
  `ip_address` char(39) DEFAULT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `historial_acciones_usuario_id_95838b1e_fk_usuarios_id` (`usuario_id`),
  CONSTRAINT `historial_acciones_usuario_id_95838b1e_fk_usuarios_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_acciones`
--

LOCK TABLES `historial_acciones` WRITE;
/*!40000 ALTER TABLE `historial_acciones` DISABLE KEYS */;
INSERT INTO `historial_acciones` VALUES (1,'2026-05-06 01:05:58.145460','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(2,'2026-05-06 01:06:35.356749','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(3,'2026-05-06 01:07:04.194780','crear','productos','CreÃ³ el producto \"luis\"',NULL,NULL,1),(4,'2026-05-06 02:12:42.095643','crear','calendario','Evento: pedro (06/05/2026 21:13)',NULL,NULL,1),(5,'2026-05-06 02:18:10.070140','crear','calendario','Evento: ReuniÃ³n Semanal (05/05/2026 21:20)',NULL,NULL,1),(6,'2026-05-06 02:19:06.517095','editar','calendario','Evento: pedro (06/05/2026 21:30)',NULL,NULL,1),(7,'2026-05-06 02:37:28.879073','editar','calendario','Evento: pedro (06/05/2026 21:30)',NULL,NULL,1),(8,'2026-05-06 02:37:54.112153','editar','calendario','Evento: ReuniÃ³n Semanal (05/05/2026 21:20)',NULL,NULL,1),(9,'2026-05-06 02:38:08.484307','editar','calendario','Estado evento \'pedro\': Completado',NULL,NULL,1),(10,'2026-05-06 02:38:10.635735','editar','calendario','Estado evento \'pedro\': Pendiente',NULL,NULL,1),(11,'2026-05-06 02:38:40.277821','editar','calendario','Estado evento \'pedro\': Completado',NULL,NULL,1),(12,'2026-05-06 02:38:41.587427','editar','calendario','Estado evento \'pedro\': Pendiente',NULL,NULL,1),(13,'2026-05-06 03:13:26.267585','crear','productos','CreÃ³ el producto \"azul\"',NULL,NULL,1),(14,'2026-05-06 03:18:36.499572','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(15,'2026-05-06 03:22:24.381346','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(16,'2026-05-06 04:57:45.281029','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(17,'2026-05-06 04:57:51.846912','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(18,'2026-05-06 04:57:55.075279','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(19,'2026-05-06 05:40:22.514919','crear','clientes','CreÃ³ el cliente \"ghjghjgh\"',NULL,NULL,1),(20,'2026-05-06 05:40:28.274485','inactivar','clientes','CambiÃ³ estado de cliente \"ghjghjgh\" a inactivado',NULL,NULL,1),(21,'2026-05-06 05:40:36.322725','activar','clientes','CambiÃ³ estado de cliente \"ghjghjgh\" a activado',NULL,NULL,1),(22,'2026-05-06 06:01:08.812535','crear','productos','CreÃ³ el producto \"Barniz mat\"',NULL,NULL,1),(23,'2026-05-06 06:02:01.388271','crear','proveedores','CreaciÃ³n de proveedor Barniz mate (ID: 1)',NULL,NULL,1),(24,'2026-05-06 06:03:45.888184','crear','entradas','RegistrÃ³ entrada de 34 un. de \"azul\"',NULL,NULL,1),(25,'2026-05-06 06:03:51.793086','eliminar','entradas','AnulÃ³ entrada #1 de \"azul\"',NULL,NULL,1),(26,'2026-05-06 06:03:57.463765','activar','entradas','ReactivÃ³ entrada #1 de \"azul\"',NULL,NULL,1),(27,'2026-05-06 06:04:53.313243','crear','calendario','Evento: pedrdas (25/05/2026 01:06)',NULL,NULL,1),(28,'2026-05-06 06:04:55.945556','editar','calendario','Estado evento \'pedrdas\': Completado',NULL,NULL,1),(29,'2026-05-06 06:04:57.428062','editar','calendario','Estado evento \'pedrdas\': Pendiente',NULL,NULL,1),(30,'2026-05-06 06:05:03.278660','editar','calendario','Evento: pedrdas (07/05/2026 01:06)',NULL,NULL,1),(31,'2026-05-06 06:05:53.569097','crear','pedidos','CreÃ³ el pedido #1 para ghjghjgh',NULL,NULL,1),(32,'2026-05-06 06:06:22.080463','consultar','reportes','ConsultÃ³ el Dashboard de Reportes y EstadÃ­sticas',NULL,NULL,1),(33,'2026-05-06 06:06:34.166857','consultar','reportes','ExportÃ³ PDF de CategorÃ­as',NULL,NULL,1);
/*!40000 ALTER TABLE `historial_acciones` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_historialchat`
--

LOCK TABLES `ia_historialchat` WRITE;
/*!40000 ALTER TABLE `ia_historialchat` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumo`
--

LOCK TABLES `insumo` WRITE;
/*!40000 ALTER TABLE `insumo` DISABLE KEYS */;
INSERT INTO `insumo` VALUES (1,'fgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfg','gfdgdfgdfg',43,'kg',345.00,'Activo',3,1);
/*!40000 ALTER TABLE `insumo` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,'sin_bom','ðŸ”§ Producto sin BOM: luis','luis no tiene receta de materiales asignada',1,'2026-05-06 01:07:32.594120',1,'{}',1),(2,'calendario_manaÃ±a','Evento MAÃ‘ANA: pedro','Preparar: pedro - 21:13:00',1,'2026-05-06 02:12:47.114644',1,'{}',1),(5,'sin_bom','Producto sin BOM: azul','azul no tiene receta de materiales asignada',1,'2026-05-06 03:13:26.513590',2,'{}',1),(6,'bajo_stock_producto','Bajo stock: azul','Producto azul solo 3 unidades',0,'2026-05-06 04:01:22.336462',2,'{\"stock\": 3}',2),(7,'calendario_manaÃ±a','Evento MAÃ‘ANA: pedro','Preparar: pedro - 21:30:00',0,'2026-05-06 04:01:22.352601',1,'{}',2),(8,'sin_bom','Producto sin BOM: luis','luis no tiene receta de materiales asignada',0,'2026-05-06 04:01:22.368527',1,'{}',2),(9,'sin_bom','Producto sin BOM: azul','azul no tiene receta de materiales asignada',1,'2026-05-06 04:01:22.376665',2,'{}',2),(10,'calendario_hoy','Evento HOY: pedro','dsfffffffff... Hora: 21:30:00',1,'2026-05-06 05:01:11.576172',1,'{}',1),(11,'calendario_hoy','Evento HOY: pedro','dsfffffffff... Hora: 21:30:00',0,'2026-05-06 05:01:27.018167',1,'{}',2),(12,'sin_bom','Producto sin BOM: Barniz mat','Barniz mat no tiene receta de materiales asignada',0,'2026-05-06 06:01:09.013856',3,'{}',1),(13,'calendario_manaÃ±a','Evento MAÃ‘ANA: pedrdas','Preparar: pedrdas - 01:06:00',0,'2026-05-06 06:05:10.788320',3,'{}',1),(14,'pago_pendiente','Pago pendiente pedido #1','Cliente ghjghjgh: $117.00',0,'2026-05-06 06:05:54.981645',1,'{}',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,'2026-05-06',117.00,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,'2026-05-06 06:05:53.550440','2026-05-14',NULL,'En FabricaciÃ³n',234.00,117.00,1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_insumo`
--

LOCK TABLES `producto_insumo` WRITE;
/*!40000 ALTER TABLE `producto_insumo` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'luis','dsfdfsdfsdfs',45.00,435,'',1,1),(2,'azul','ggggggggggggggggggg',234.00,36,'',1,1),(3,'Barniz mat','fdgsssssssssssss',435.00,345,'',1,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Barniz mate','3444444444','345gfddddddddddddddddd','dfgdfgerterter','',1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor_insumo`
--

LOCK TABLES `proveedor_insumo` WRITE;
/*!40000 ALTER TABLE `proveedor_insumo` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respaldos`
--

LOCK TABLES `respaldos` WRITE;
/*!40000 ALTER TABLE `respaldos` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salida_producto`
--

LOCK TABLES `salida_producto` WRITE;
/*!40000 ALTER TABLE `salida_producto` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervision`
--

LOCK TABLES `supervision` WRITE;
/*!40000 ALTER TABLE `supervision` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'pbkdf2_sha256$1200000$GviveZ7hbrH5OZyiyjbN3i$vYYLsFQzxXmL6qy7f/SiKpLcWU1ntqhwPMgt6g3ijcw=','2026-05-06 02:11:31.057824',1,'luis','','',1,1,'2026-05-06 01:04:45.708938','34','admi','Activo','',NULL,'luis@gmail.com'),(2,'pbkdf2_sha256$1200000$oaTGEG7P1Teyy8fBuaNsQP$1N8qyt1OG9EiZCHAX/hfye/UJpXIW+82YrHcxWV8fJ8=','2026-05-06 04:01:22.040698',0,'tester','Test','User',0,1,'2026-05-06 04:00:36.209177','1234567890','administrador','Activo','','0987654321','tester@example.com');
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

-- Dump completed on 2026-05-06  1:07:03
