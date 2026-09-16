/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for osx10.21 (arm64)
--
-- Host: 127.0.0.1    Database: apps_infinityfree_build_20260813
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dispensed_items`
--

DROP TABLE IF EXISTS `dispensed_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispensed_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `dispensing_record_id` bigint(20) unsigned NOT NULL,
  `medicine_inventory_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dispensed_items_dispensing_record_id_foreign` (`dispensing_record_id`),
  KEY `dispensed_items_medicine_inventory_id_foreign` (`medicine_inventory_id`),
  CONSTRAINT `dispensed_items_dispensing_record_id_foreign` FOREIGN KEY (`dispensing_record_id`) REFERENCES `dispensing_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dispensed_items_medicine_inventory_id_foreign` FOREIGN KEY (`medicine_inventory_id`) REFERENCES `medicine_inventories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispensed_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dispensed_items` WRITE;
/*!40000 ALTER TABLE `dispensed_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `dispensed_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dispensing_records`
--

DROP TABLE IF EXISTS `dispensing_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispensing_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `prescription_id` bigint(20) unsigned NOT NULL,
  `pharmacist_id` bigint(20) unsigned NOT NULL,
  `dispensed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dispensing_records_prescription_id_foreign` (`prescription_id`),
  KEY `dispensing_records_pharmacist_id_foreign` (`pharmacist_id`),
  CONSTRAINT `dispensing_records_pharmacist_id_foreign` FOREIGN KEY (`pharmacist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dispensing_records_prescription_id_foreign` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispensing_records`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dispensing_records` WRITE;
/*!40000 ALTER TABLE `dispensing_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `dispensing_records` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `medicine_inventories`
--

DROP TABLE IF EXISTS `medicine_inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_inventories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `medicine_id` bigint(20) unsigned NOT NULL,
  `batch_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reorder_level` int(11) NOT NULL DEFAULT 10,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medicine_inventories_medicine_id_foreign` (`medicine_id`),
  CONSTRAINT `medicine_inventories_medicine_id_foreign` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_inventories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `medicine_inventories` WRITE;
/*!40000 ALTER TABLE `medicine_inventories` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicine_inventories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `generic_name` varchar(255) NOT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `dosage_form` varchar(255) DEFAULT NULL,
  `strength` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES
(1,'Allopurinol',NULL,'Tablet/Capsule','Tablet','300mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(2,'Aluminium + Magnesium OH',NULL,'Tablet/Capsule','Tablet','200mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(3,'Amlodipine',NULL,'Tablet/Capsule','Tablet','10mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(4,'Amlodipine',NULL,'Tablet/Capsule','Tablet','5mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(5,'Amoxicillin',NULL,'Tablet/Capsule','Capsule','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(6,'Aspirin',NULL,'Tablet/Capsule','Tablet','80mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(7,'Atorvastatin',NULL,'Tablet/Capsule','Tablet','20mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(8,'Azithromycin',NULL,'Tablet/Capsule','Tablet','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(9,'Calcium Carbonate',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(10,'Cefuroxime',NULL,'Tablet/Capsule','Tablet','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(11,'Celecoxib',NULL,'Tablet/Capsule','Tablet','200mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(12,'Cetirizine',NULL,'Tablet/Capsule','Tablet','10mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(13,'Chlorphen+PPA+APAP',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(14,'Ciprofloxacin',NULL,'Tablet/Capsule','Tablet','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(15,'Clopidogrel',NULL,'Tablet/Capsule','Tablet','75mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(16,'Cloxacillin',NULL,'Tablet/Capsule','Capsule','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(17,'Co-amoxiclav',NULL,'Tablet/Capsule','Tablet','625mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(18,'Doxofylline',NULL,'Tablet/Capsule','Tablet','400mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(19,'Doxycycline',NULL,'Tablet/Capsule','Capsule','100mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(20,'Febuxostat',NULL,'Tablet/Capsule','Tablet','40mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(21,'Fenofibrate',NULL,'Tablet/Capsule','Tablet','160mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(22,'Ferrous Sulfate + Folic Acid',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(23,'Ferrous Sulfate',NULL,'Tablet/Capsule','Tablet','325mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(24,'Gliclazide',NULL,'Tablet/Capsule','Tablet','80mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(25,'Lagundi',NULL,'Tablet/Capsule','Tablet','300mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(26,'Losartan + HCTZ',NULL,'Tablet/Capsule','Tablet','50mg/12.5mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(27,'Losartan',NULL,'Tablet/Capsule','Tablet','100mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(28,'Losartan',NULL,'Tablet/Capsule','Tablet','50mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(29,'Mefenamic Acid',NULL,'Tablet/Capsule','Capsule','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(30,'Metformin',NULL,'Tablet/Capsule','Tablet','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(31,'Metoprolol',NULL,'Tablet/Capsule','Tablet','100mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(32,'Metoprolol',NULL,'Tablet/Capsule','Tablet','50mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(33,'Montelukast + Levocetirizine',NULL,'Tablet/Capsule','Tablet','10/5mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(34,'Multiple Micronutrient Supplement',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(35,'Omeprazole',NULL,'Tablet/Capsule','Tablet','40mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(36,'ORS',NULL,'Tablet/Capsule','Powder',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(37,'Paracetamol',NULL,'Tablet/Capsule','Tablet','500mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(38,'Salbutamol',NULL,'Tablet/Capsule','Tablet','2mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(39,'Sambong',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(40,'Telmisartan',NULL,'Tablet/Capsule','Tablet','40mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(41,'Trimetazidine',NULL,'Tablet/Capsule','Tablet','35mg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(42,'Vitamin B complex',NULL,'Tablet/Capsule','Tablet',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(43,'Amoxicillin',NULL,'Syrup/Suspension','Syrup','250mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(44,'Ascorbic Acid',NULL,'Syrup/Suspension','Syrup',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(45,'Cefalexin',NULL,'Syrup/Suspension','Syrup','125mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(46,'Cefalexin',NULL,'Syrup/Suspension','Syrup','250mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(47,'Cetirizine',NULL,'Syrup/Suspension','Syrup','5mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(48,'Cloxacillin',NULL,'Syrup/Suspension','Syrup','125mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(49,'Cloxacillin',NULL,'Syrup/Suspension','Syrup','250mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(50,'Co-amoxiclav',NULL,'Syrup/Suspension','Syrup','312.5mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(51,'Lagundi',NULL,'Syrup/Suspension','Syrup',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(52,'Mefenamic',NULL,'Syrup/Suspension','Syrup','50mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(53,'Multivitamins',NULL,'Syrup/Suspension','Syrup',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(54,'Paracetamol',NULL,'Syrup/Suspension','Syrup','250mg/5ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(55,'Zinc',NULL,'Syrup/Suspension','Syrup',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(56,'Amoxicillin',NULL,'Drops','Drops','100mg/ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(57,'Ascorbic Acid',NULL,'Drops','Drops',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(58,'Carbocisteine',NULL,'Drops','Drops',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(59,'Cefalexin',NULL,'Drops','Drops','100mg/ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(60,'Cetirizine',NULL,'Drops','Drops','2.5mg/ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(61,'Multivitamins',NULL,'Drops','Drops',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(62,'Paracetamol',NULL,'Drops','Drops','100mg/ml',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(63,'Zinc',NULL,'Drops','Drops',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(64,'Betamethasone',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(65,'Calamine + Zinc Oxide',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(66,'Clobetasol',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(67,'Clotrimazole',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(68,'Mupirocin',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(69,'Silver Sulfadiazine',NULL,'Ointment/Cream','Ointment',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(70,'Budesonide + Formoterol Fumarate',NULL,'Inhaler/Nebule','Inhaler','160mcg/4.5mcg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(71,'Salbutamol',NULL,'Inhaler/Nebule','Nebule',NULL,NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16'),
(72,'Salmeterol + Fluticasone Propionate',NULL,'Inhaler/Nebule','Inhaler','25mcg/250mcg',NULL,'2026-08-13 07:24:16','2026-08-13 07:24:16');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2024_01_01_000003_create_patients_table',1),
(5,'2024_01_01_000004_create_medicines_table',1),
(6,'2024_01_01_000005_create_medicine_inventories_table',1),
(7,'2024_01_01_000006_create_prescriptions_table',1),
(8,'2024_01_01_000007_create_prescription_items_table',1),
(9,'2024_01_01_000008_create_dispensing_records_table',1),
(10,'2024_01_01_000009_create_dispensed_items_table',1),
(11,'2024_01_01_000010_create_activity_logs_table',1),
(12,'2024_01_01_000011_add_role_to_users_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES
(1,'Pedro','Penduko','1985-03-15','male','09171234567','123 Rizal St., San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(2,'Juana','Dela Cruz','1992-07-22','female','09189876543','456 Mabini St., San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(3,'Ramon','Aggabao','1958-02-14','male','09171234501','Purok 2, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(4,'Liza','Cauilan','1990-08-23','female','09181234502','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(5,'Jomar','Binag','1985-11-05','male','09171234503','Purok 3, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(6,'Rosalinda','Lacambra','1972-04-30','female','09181234504','Purok 2, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(7,'Bryan','Tumaliuan','1997-01-19','male','09171234505','Purok 1, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(8,'Nenita','Agustin','1960-12-08','female','09181234506','Purok 4, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(9,'Kevin','Alviar','2006-06-17','male','09171234507','Purok 3, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(10,'Marites','Domingo','1993-09-27','female','09181234508','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(11,'Eduardo','Panganiban','1949-03-02','male','09171234509','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(12,'Angelica','Reyes','2015-05-11','female','09181234510','Purok 1, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(13,'Nestor','Guzman','1978-07-25','male','09171234511','Purok 4, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(14,'Jonalyn','Ballesteros','2001-10-14','female','09181234512','Purok 2, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(15,'Danilo','Castillo','1968-12-30','male','09171234513','Purok 3, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(16,'Kimberly','Flores','2010-02-09','female','09181234514','Purok 1, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(17,'Santiago','Bautista','1939-06-21','male','09171234515','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(18,'Rodel','Aguinaldo','1964-09-12','male','09174561001','Purok 1, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(19,'Babylyn','Soriano','1998-03-27','female','09174561002','Purok 2, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(20,'Teodoro','Magtoto','1955-11-30','male','09174561003','Purok 3, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(21,'Janice','Villanueva','1988-06-18','female','09174561004','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(22,'Gregorio','Salazar','1972-02-05','male','09174561005','Purok 2, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(23,'Melissa','Talavera','2003-10-09','female','09174561006','Purok 4, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(24,'Juan','Santos','1940-01-01','male','0900000000','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(25,'Ana','Santos','1977-02-08','female','0900012345','Purok 2, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(26,'Pedro','Santos','2014-03-15','male','0900024690','Purok 3, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(27,'Rose','Santos','1975-04-22','female','0900037035','Purok 4, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(28,'Mario','Santos','2012-05-01','male','0900049380','Purok 5, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(29,'Jennifer','Santos','1973-06-08','female','0900061725','Purok 6, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(30,'Ronaldo','Santos','2010-07-15','male','0900074070','Purok 7, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(31,'Jonalyn','Santos','1971-08-22','female','0900086415','Purok 1, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(32,'Bryan','Santos','2008-09-01','male','0900098760','Purok 2, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(33,'Michelle','Santos','1969-10-08','female','0900111105','Purok 3, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(34,'Nestor','Santos','2006-11-15','male','0900123450','Purok 4, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(35,'Kimberly','Santos','1967-12-22','female','0900135795','Purok 5, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(36,'Eduardo','Santos','2004-01-01','male','0900148140','Purok 6, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(37,'Catherine','Santos','1965-02-08','female','0900160485','Purok 7, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(38,'Mark','Santos','2002-03-15','male','0900172830','Purok 1, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(39,'Analyn','Santos','1963-04-22','female','0900185175','Purok 2, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(40,'John','Santos','2000-05-01','male','0900197520','Purok 3, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(41,'Jessa','Santos','1961-06-08','female','0900209865','Purok 4, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(42,'Carlo','Santos','1998-07-15','male','0900222210','Purok 5, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(43,'Aileen','Santos','1959-08-22','female','0900234555','Purok 6, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(44,'Arnel','Santos','1996-09-01','male','0900246900','Purok 7, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(45,'Evelyn','Santos','1957-10-08','female','0900259245','Purok 1, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(46,'Ricky','Santos','1994-11-15','male','0900271590','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(47,'Imelda','Santos','1955-12-22','female','0900283935','Purok 3, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(48,'Rodel','Santos','1992-01-01','male','0900296280','Purok 4, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(49,'Luzviminda','Santos','1953-02-08','female','0900308625','Purok 5, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(50,'Erwin','Santos','1990-03-15','male','0900320970','Purok 6, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(51,'Nenita','Santos','1951-04-22','female','0900333315','Purok 7, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(52,'Rogelio','Santos','1988-05-01','male','0900345660','Purok 1, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(53,'Rowena','Santos','1949-06-08','female','0900358005','Purok 2, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(54,'Dominic','Santos','1986-07-15','male','0900370350','Purok 3, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(55,'Teresita','Santos','1947-08-22','female','0900382695','Purok 4, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(56,'Roland','Santos','1984-09-01','male','0900395040','Purok 5, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(57,'Yolanda','Santos','1945-10-08','female','0900407385','Purok 6, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(58,'Rommel','Santos','1982-11-15','male','0900419730','Purok 7, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(59,'Babylyn','Santos','1943-12-22','female','0900432075','Purok 1, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(60,'Edwin','Santos','1980-01-01','male','0900444420','Purok 2, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(61,'Divina','Santos','1941-02-08','female','0900456765','Purok 3, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(62,'Rodolfo','Santos','1978-03-15','male','0900469110','Purok 4, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(63,'Fely','Santos','2015-04-22','female','0900481455','Purok 5, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(64,'Gener','Santos','1976-05-01','male','0900493800','Purok 6, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(65,'Hazel','Santos','2013-06-08','female','0900506145','Purok 7, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(66,'Rafael','Santos','1974-07-15','male','0900518490','Purok 1, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(67,'Janice','Santos','2011-08-22','female','0900530835','Purok 2, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(68,'Tomas','Santos','1972-09-01','male','0900543180','Purok 3, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(69,'Margarita','Santos','2009-10-08','female','0900555525','Purok 4, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(70,'Walter','Santos','1970-11-15','male','0900567870','Purok 5, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(71,'Odessa','Santos','2007-12-22','female','0900580215','Purok 6, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(72,'Antonio','Santos','1968-01-01','male','0900592560','Purok 7, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(73,'Rachelle','Santos','2005-02-08','female','0900604905','Purok 1, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(74,'Francisco','Santos','1966-03-15','male','0900617250','Purok 2, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(75,'Theresa','Santos','2003-04-22','female','0900629595','Purok 3, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(76,'Gregorio','Santos','1964-05-01','male','0900641940','Purok 4, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(77,'Vivian','Santos','2001-06-08','female','0900654285','Purok 5, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(78,'Teodoro','Santos','1962-07-15','male','0900666630','Purok 6, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(79,'Alyssa','Santos','1999-08-22','female','0900678975','Purok 7, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(80,'Feliciano','Santos','1960-09-01','male','0900691320','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(81,'Clarissa','Santos','1997-10-08','female','0900703665','Purok 2, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(82,'Honorio','Santos','1958-11-15','male','0900716010','Purok 3, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(83,'Elena','Santos','1995-12-22','female','0900728355','Purok 4, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(84,'Juan','Reyes','1956-01-01','male','0900740700','Purok 5, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(85,'Ana','Reyes','1993-02-08','female','0900753045','Purok 6, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(86,'Pedro','Reyes','1954-03-15','male','0900765390','Purok 7, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(87,'Rose','Reyes','1991-04-22','female','0900777735','Purok 1, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(88,'Mario','Reyes','1952-05-01','male','0900790080','Purok 2, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(89,'Jennifer','Reyes','1989-06-08','female','0900802425','Purok 3, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(90,'Ronaldo','Reyes','1950-07-15','male','0900814770','Purok 4, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(91,'Jonalyn','Reyes','1987-08-22','female','0900827115','Purok 5, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(92,'Bryan','Reyes','1948-09-01','male','0900839460','Purok 6, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(93,'Michelle','Reyes','1985-10-08','female','0900851805','Purok 7, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(94,'Nestor','Reyes','1946-11-15','male','0900864150','Purok 1, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(95,'Kimberly','Reyes','1983-12-22','female','0900876495','Purok 2, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(96,'Eduardo','Reyes','1944-01-01','male','0900888840','Purok 3, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(97,'Catherine','Reyes','1981-02-08','female','0900901185','Purok 4, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(98,'Mark','Reyes','1942-03-15','male','0900913530','Purok 5, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(99,'Analyn','Reyes','1979-04-22','female','0900925875','Purok 6, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(100,'John','Reyes','1940-05-01','male','0900938220','Purok 7, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(101,'Jessa','Reyes','1977-06-08','female','0900950565','Purok 1, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(102,'Carlo','Reyes','2014-07-15','male','0900962910','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(103,'Aileen','Reyes','1975-08-22','female','0900975255','Purok 3, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(104,'Arnel','Reyes','2012-09-01','male','0900987600','Purok 4, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(105,'Evelyn','Reyes','1973-10-08','female','0900999945','Purok 5, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(106,'Ricky','Reyes','2010-11-15','male','0901012290','Purok 6, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(107,'Imelda','Reyes','1971-12-22','female','0901024635','Purok 7, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(108,'Rodel','Reyes','2008-01-01','male','0901036980','Purok 1, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(109,'Luzviminda','Reyes','1969-02-08','female','0901049325','Purok 2, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(110,'Erwin','Reyes','2006-03-15','male','0901061670','Purok 3, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(111,'Nenita','Reyes','1967-04-22','female','0901074015','Purok 4, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(112,'Rogelio','Reyes','2004-05-01','male','0901086360','Purok 5, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(113,'Rowena','Reyes','1965-06-08','female','0901098705','Purok 6, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(114,'Dominic','Reyes','2002-07-15','male','0901111050','Purok 7, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(115,'Teresita','Reyes','1963-08-22','female','0901123395','Purok 1, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(116,'Roland','Reyes','2000-09-01','male','0901135740','Purok 2, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(117,'Yolanda','Reyes','1961-10-08','female','0901148085','Purok 3, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(118,'Rommel','Reyes','1998-11-15','male','0901160430','Purok 4, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(119,'Babylyn','Reyes','1959-12-22','female','0901172775','Purok 5, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(120,'Edwin','Reyes','1996-01-01','male','0901185120','Purok 6, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(121,'Divina','Reyes','1957-02-08','female','0901197465','Purok 7, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(122,'Rodolfo','Reyes','1994-03-15','male','0901209810','Purok 1, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(123,'Fely','Reyes','1955-04-22','female','0901222155','Purok 2, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(124,'Gener','Reyes','1992-05-01','male','0901234500','Purok 3, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(125,'Hazel','Reyes','1953-06-08','female','0901246845','Purok 4, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(126,'Rafael','Reyes','1990-07-15','male','0901259190','Purok 5, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(127,'Janice','Reyes','1951-08-22','female','0901271535','Purok 6, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(128,'Tomas','Reyes','1988-09-01','male','0901283880','Purok 7, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(129,'Margarita','Reyes','1949-10-08','female','0901296225','Purok 1, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(130,'Walter','Reyes','1986-11-15','male','0901308570','Purok 2, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(131,'Odessa','Reyes','1947-12-22','female','0901320915','Purok 3, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(132,'Antonio','Reyes','1984-01-01','male','0901333260','Purok 4, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(133,'Rachelle','Reyes','1945-02-08','female','0901345605','Purok 5, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(134,'Francisco','Reyes','1982-03-15','male','0901357950','Purok 6, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(135,'Theresa','Reyes','1943-04-22','female','0901370295','Purok 7, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(136,'Gregorio','Reyes','1980-05-01','male','0901382640','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:16','2026-08-13 07:24:16'),
(137,'Vivian','Reyes','1941-06-08','female','0901394985','Purok 2, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(138,'Teodoro','Reyes','1978-07-15','male','0901407330','Purok 3, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(139,'Alyssa','Reyes','2015-08-22','female','0901419675','Purok 4, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(140,'Feliciano','Reyes','1976-09-01','male','0901432020','Purok 5, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(141,'Clarissa','Reyes','2013-10-08','female','0901444365','Purok 6, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(142,'Honorio','Reyes','1974-11-15','male','0901456710','Purok 7, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(143,'Elena','Reyes','2011-12-22','female','0901469055','Purok 1, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(144,'Juan','Garcia','1972-01-01','male','0901481400','Purok 2, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(145,'Ana','Garcia','2009-02-08','female','0901493745','Purok 3, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(146,'Pedro','Garcia','1970-03-15','male','0901506090','Purok 4, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(147,'Rose','Garcia','2007-04-22','female','0901518435','Purok 5, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(148,'Mario','Garcia','1968-05-01','male','0901530780','Purok 6, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(149,'Jennifer','Garcia','2005-06-08','female','0901543125','Purok 7, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(150,'Ronaldo','Garcia','1966-07-15','male','0901555470','Purok 1, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(151,'Jonalyn','Garcia','2003-08-22','female','0901567815','Purok 2, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(152,'Bryan','Garcia','1964-09-01','male','0901580160','Purok 3, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(153,'Michelle','Garcia','2001-10-08','female','0901592505','Purok 4, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(154,'Nestor','Garcia','1962-11-15','male','0901604850','Purok 5, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(155,'Kimberly','Garcia','1999-12-22','female','0901617195','Purok 6, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(156,'Eduardo','Garcia','1960-01-01','male','0901629540','Purok 7, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(157,'Catherine','Garcia','1997-02-08','female','0901641885','Purok 1, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(158,'Mark','Garcia','1958-03-15','male','0901654230','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(159,'Analyn','Garcia','1995-04-22','female','0901666575','Purok 3, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(160,'John','Garcia','1956-05-01','male','0901678920','Purok 4, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(161,'Jessa','Garcia','1993-06-08','female','0901691265','Purok 5, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(162,'Carlo','Garcia','1954-07-15','male','0901703610','Purok 6, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(163,'Aileen','Garcia','1991-08-22','female','0901715955','Purok 7, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(164,'Arnel','Garcia','1952-09-01','male','0901728300','Purok 1, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(165,'Evelyn','Garcia','1989-10-08','female','0901740645','Purok 2, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(166,'Ricky','Garcia','1950-11-15','male','0901752990','Purok 3, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(167,'Imelda','Garcia','1987-12-22','female','0901765335','Purok 4, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(168,'Rodel','Garcia','1948-01-01','male','0901777680','Purok 5, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(169,'Luzviminda','Garcia','1985-02-08','female','0901790025','Purok 6, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(170,'Erwin','Garcia','1946-03-15','male','0901802370','Purok 7, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(171,'Nenita','Garcia','1983-04-22','female','0901814715','Purok 1, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(172,'Rogelio','Garcia','1944-05-01','male','0901827060','Purok 2, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(173,'Rowena','Garcia','1981-06-08','female','0901839405','Purok 3, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(174,'Dominic','Garcia','1942-07-15','male','0901851750','Purok 4, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(175,'Teresita','Garcia','1979-08-22','female','0901864095','Purok 5, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(176,'Roland','Garcia','1940-09-01','male','0901876440','Purok 6, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(177,'Yolanda','Garcia','1977-10-08','female','0901888785','Purok 7, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(178,'Rommel','Garcia','2014-11-15','male','0901901130','Purok 1, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(179,'Babylyn','Garcia','1975-12-22','female','0901913475','Purok 2, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(180,'Edwin','Garcia','2012-01-01','male','0901925820','Purok 3, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(181,'Divina','Garcia','1973-02-08','female','0901938165','Purok 4, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(182,'Rodolfo','Garcia','2010-03-15','male','0901950510','Purok 5, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(183,'Fely','Garcia','1971-04-22','female','0901962855','Purok 6, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(184,'Gener','Garcia','2008-05-01','male','0901975200','Purok 7, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(185,'Hazel','Garcia','1969-06-08','female','0901987545','Purok 1, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(186,'Rafael','Garcia','2006-07-15','male','0901999890','Purok 2, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(187,'Janice','Garcia','1967-08-22','female','0902012235','Purok 3, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(188,'Tomas','Garcia','2004-09-01','male','0902024580','Purok 4, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(189,'Margarita','Garcia','1965-10-08','female','0902036925','Purok 5, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(190,'Walter','Garcia','2002-11-15','male','0902049270','Purok 6, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(191,'Odessa','Garcia','1963-12-22','female','0902061615','Purok 7, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(192,'Antonio','Garcia','2000-01-01','male','0902073960','Purok 1, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(193,'Rachelle','Garcia','1961-02-08','female','0902086305','Purok 2, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(194,'Francisco','Garcia','1998-03-15','male','0902098650','Purok 3, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(195,'Theresa','Garcia','1959-04-22','female','0902110995','Purok 4, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(196,'Gregorio','Garcia','1996-05-01','male','0902123340','Purok 5, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(197,'Vivian','Garcia','1957-06-08','female','0902135685','Purok 6, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(198,'Teodoro','Garcia','1994-07-15','male','0902148030','Purok 7, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(199,'Alyssa','Garcia','1955-08-22','female','0902160375','Purok 1, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(200,'Feliciano','Garcia','1992-09-01','male','0902172720','Purok 2, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(201,'Clarissa','Garcia','1953-10-08','female','0902185065','Purok 3, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(202,'Honorio','Garcia','1990-11-15','male','0902197410','Purok 4, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(203,'Elena','Garcia','1951-12-22','female','0902209755','Purok 5, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(204,'Juan','Mendoza','1988-01-01','male','0902222100','Purok 6, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(205,'Ana','Mendoza','1949-02-08','female','0902234445','Purok 7, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(206,'Pedro','Mendoza','1986-03-15','male','0902246790','Purok 1, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(207,'Rose','Mendoza','1947-04-22','female','0902259135','Purok 2, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(208,'Mario','Mendoza','1984-05-01','male','0902271480','Purok 3, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(209,'Jennifer','Mendoza','1945-06-08','female','0902283825','Purok 4, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(210,'Ronaldo','Mendoza','1982-07-15','male','0902296170','Purok 5, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(211,'Jonalyn','Mendoza','1943-08-22','female','0902308515','Purok 6, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(212,'Bryan','Mendoza','1980-09-01','male','0902320860','Purok 7, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(213,'Michelle','Mendoza','1941-10-08','female','0902333205','Purok 1, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(214,'Nestor','Mendoza','1978-11-15','male','0902345550','Purok 2, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(215,'Kimberly','Mendoza','2015-12-22','female','0902357895','Purok 3, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(216,'Eduardo','Mendoza','1976-01-01','male','0902370240','Purok 4, Brgy. Centro, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(217,'Catherine','Mendoza','2013-02-08','female','0902382585','Purok 5, Brgy. San Juan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(218,'Mark','Mendoza','1974-03-15','male','0902394930','Purok 6, Brgy. San Gabriel, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(219,'Analyn','Mendoza','2011-04-22','female','0902407275','Purok 7, Brgy. Malalinta, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(220,'John','Mendoza','1972-05-01','male','0902419620','Purok 1, Brgy. Calanigan, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(221,'Jessa','Mendoza','2009-06-08','female','0902431965','Purok 2, Brgy. San Marcos, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(222,'Carlo','Mendoza','1970-07-15','male','0902444310','Purok 3, Brgy. Salay, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17'),
(223,'Aileen','Mendoza','2007-08-22','female','0902456655','Purok 4, Brgy. San Vicente, San Manuel, Isabela','2026-08-13 07:24:17','2026-08-13 07:24:17');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `prescription_id` bigint(20) unsigned NOT NULL,
  `medicine_id` bigint(20) unsigned NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_items_prescription_id_foreign` (`prescription_id`),
  KEY `prescription_items_medicine_id_foreign` (`medicine_id`),
  CONSTRAINT `prescription_items_medicine_id_foreign` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescription_items_prescription_id_foreign` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `prescription_number` varchar(255) NOT NULL,
  `diagnosis` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescriptions_prescription_number_unique` (`prescription_number`),
  KEY `prescriptions_patient_id_foreign` (`patient_id`),
  KEY `prescriptions_doctor_id_foreign` (`doctor_id`),
  CONSTRAINT `prescriptions_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescriptions_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'doctor',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Dr. Juan Dela Cruz','doctor@apps.test','2026-08-13 07:24:16','$2y$12$ETT8YJVF0n3lS.89fPXagO/GqH33bMgtDZWq/e8mTJ77ITL7mnIYW','wkdafoRSdV','2026-08-13 07:24:16','2026-08-13 07:24:16','doctor',1),
(2,'Maria Santos, RPh','pharmacist@apps.test','2026-08-13 07:24:16','$2y$12$yhC/iVccuQ3ewAcpGH.F0.DLkvmdqNW5iiIuS.TP4JYl2swZR7ZiO','4Y6oGnNokk','2026-08-13 07:24:16','2026-08-13 07:24:16','pharmacist',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-13 15:24:17
