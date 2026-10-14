-- APPS update: staff role, patient vitals, activity-feed pick-up history.
-- SAFE for a live database: adds things only, never drops or truncates.
-- Run ONCE in InfinityFree phpMyAdmin (SQL tab) on the existing APPS database.
-- Back up first: phpMyAdmin > Export.

SET NAMES utf8mb4;

CREATE TABLE `patient_vitals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `bp_systolic` smallint(5) unsigned DEFAULT NULL,
  `bp_diastolic` smallint(5) unsigned DEFAULT NULL,
  `height_cm` decimal(5,1) DEFAULT NULL,
  `weight_kg` decimal(5,1) DEFAULT NULL,
  `temperature_c` decimal(4,1) DEFAULT NULL,
  `pulse_rate` smallint(5) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_vitals_recorded_by_foreign` (`recorded_by`),
  KEY `patient_vitals_patient_id_created_at_index` (`patient_id`,`created_at`),
  CONSTRAINT `patient_vitals_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_vitals_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `activity_logs`
  ADD COLUMN `prescription_id` bigint(20) unsigned NULL DEFAULT NULL,
  ADD INDEX `activity_logs_prescription_id_index` (`prescription_id`);

-- Link existing prescription log rows to their prescription (matches the RX number in the description).
UPDATE `activity_logs` a
JOIN `prescriptions` p ON a.`description` LIKE CONCAT('%', p.`prescription_number`, '%')
SET a.`prescription_id` = p.`id`
WHERE a.`prescription_id` IS NULL;

-- Keep Laravel's migration bookkeeping in sync.
INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_09_30_000001_create_patient_vitals_table', COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`;
INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_09_30_000002_add_prescription_id_to_activity_logs_table', COALESCE(MAX(`batch`), 0) FROM `migrations`;

-- OPTIONAL: demo front-desk login (staff@apps.test / password). Change the password after first login.
-- INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`)
-- VALUES ('Front Desk Staff', 'staff@apps.test', '$2y$12$gZNEUGjc9elX6X4V4LZgl.bJZWF44G5GuKVOfqJFUY77Pc1ROY1QW', 'staff', 1, NOW(), NOW());
