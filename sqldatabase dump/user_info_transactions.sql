CREATE DATABASE  IF NOT EXISTS `user_info` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `user_info`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: user_info
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (6,2,'2024-07-06 13:47:51',100.00,'Transfer'),(7,7,'2024-07-07 02:24:44',-10.00,'Transfer'),(8,8,'2024-07-07 02:24:44',10.00,'Transfer'),(9,8,'2024-07-07 12:25:27',-10.00,'Transfer'),(10,7,'2024-07-07 12:25:27',10.00,'Transfer'),(11,7,'2024-07-07 12:38:12',-10.00,'Transfer'),(12,8,'2024-07-07 12:38:12',10.00,'Transfer'),(13,8,'2024-07-07 12:40:12',-20.00,'Transfer'),(14,7,'2024-07-07 12:40:12',20.00,'Transfer'),(16,8,'2024-07-07 12:40:36',10.00,'Transfer'),(17,7,'2024-07-07 13:14:30',-23.00,'Transfer'),(18,8,'2024-07-07 13:14:30',23.00,'Transfer'),(19,7,'2024-07-08 00:55:01',-28.00,'Transfer'),(20,8,'2024-07-08 00:55:01',28.00,'Transfer'),(21,7,'2024-07-08 01:16:58',-1.90,'Transfer'),(22,8,'2024-07-08 01:16:58',1.90,'Transfer'),(23,7,'2024-07-09 14:13:44',-1.99,'Transfer'),(24,8,'2024-07-09 14:13:44',1.99,'Transfer'),(25,7,'2024-07-10 05:49:28',-0.11,'Transfer'),(26,8,'2024-07-10 05:49:28',0.11,'Transfer');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-10 14:35:03
