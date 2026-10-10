-- ============================================================
-- Income Tax Calculation & Filing System
-- Database Schema Definition (schema.sql)
-- Target RDBMS: MySQL / MariaDB (phpMyAdmin Compatible)
-- Database Name: income_tax_system
-- ============================================================

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS `income_tax_system`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `income_tax_system`;

-- Disable foreign key checks for clean recreation
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 2. Drop existing tables if they exist (child tables first)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tax_calculation_details`;
DROP TABLE IF EXISTS `tax_calculations`;
DROP TABLE IF EXISTS `surcharge_rules`;
DROP TABLE IF EXISTS `tax_rebate_rules`;
DROP TABLE IF EXISTS `minimum_tax_rules`;
DROP TABLE IF EXISTS `tax_thresholds`;
DROP TABLE IF EXISTS `tax_rules`;
DROP TABLE IF EXISTS `tax_deductions`;
DROP TABLE IF EXISTS `tax_deduction_rules`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `expense_types`;
DROP TABLE IF EXISTS `income`;
DROP TABLE IF EXISTS `taxpayer_profiles`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- Table 1: users
-- Core authentication and user management table
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `nid` VARCHAR(50) NOT NULL UNIQUE,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_nid` (`nid`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 2: taxpayer_profiles
-- Detailed demographic profile for tax exemption calculation
-- ------------------------------------------------------------
CREATE TABLE `taxpayer_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `date_of_birth` DATE NOT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'THIRD_GENDER') NOT NULL,
  `minimum_tax_area` VARCHAR(50) NOT NULL DEFAULT 'OTHER_AREA',
  `is_new_taxpayer` TINYINT(1) NOT NULL DEFAULT 0,
  `is_physically_challenged` TINYINT(1) NOT NULL DEFAULT 0,
  `disabled_child_dependents` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_freedom_fighter` TINYINT(1) NOT NULL DEFAULT 0,
  `is_july_warrior` TINYINT(1) NOT NULL DEFAULT 0,
  `net_wealth` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
  `has_multiple_motor_vehicles` TINYINT(1) NOT NULL DEFAULT 0,
  `has_large_house_property` TINYINT(1) NOT NULL DEFAULT 0,
  `tds_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `advance_tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_taxpayer_profiles_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_taxpayer_profiles_area` (`minimum_tax_area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 3: income
-- Tracks all individual income streams of taxpayers
-- ------------------------------------------------------------
CREATE TABLE `income` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `income_type` VARCHAR(50) NOT NULL,
  `source_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `income_date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_income_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_income_user_date` (`user_id`, `income_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 4: expense_types
-- Master catalog of business and personal expense categories
-- ------------------------------------------------------------
CREATE TABLE `expense_types` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `expense_code` VARCHAR(50) NOT NULL UNIQUE,
  `expense_name` VARCHAR(150) NOT NULL,
  `expense_category` ENUM('BUSINESS', 'PERSONAL') NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_expense_types_cat_status` (`expense_category`, `status`),
  INDEX `idx_expense_types_dates` (`effective_from`, `effective_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 5: expenses
-- Tracks user business and personal expenses
-- (Business expenses with is_tax_deductible=1 reduce taxable income)
-- ------------------------------------------------------------
CREATE TABLE `expenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `expense_type_id` INT UNSIGNED NOT NULL,
  `expense_type` VARCHAR(150) NOT NULL,
  `expense_category` ENUM('BUSINESS', 'PERSONAL') NOT NULL,
  `is_tax_deductible` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expenses_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_expenses_type` FOREIGN KEY (`expense_type_id`)
    REFERENCES `expense_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_expenses_user_date` (`user_id`, `expense_date`),
  INDEX `idx_expenses_deductible` (`user_id`, `expense_category`, `is_tax_deductible`, `expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 6: tax_deduction_rules
-- Rules defining eligible investment deductions (e.g. DPS, Life Insurance)
-- ------------------------------------------------------------
CREATE TABLE `tax_deduction_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `deduction_code` VARCHAR(50) NOT NULL,
  `deduction_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `income_type` VARCHAR(50) DEFAULT NULL,
  `calculation_type` ENUM('FIXED', 'PERCENTAGE', 'LIMITED', 'ACTUAL') NOT NULL DEFAULT 'ACTUAL',
  `deduction_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `maximum_amount` DECIMAL(15, 2) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_deduction_rule_year_code` (`tax_year`, `deduction_code`),
  INDEX `idx_deduction_rules_lookup` (`tax_year`, `status`, `effective_from`, `effective_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 7: tax_deductions
-- Individual taxpayer investment and deduction entries
-- ------------------------------------------------------------
CREATE TABLE `tax_deductions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `tax_year` VARCHAR(20) NOT NULL,
  `deduction_code` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `deduction_date` DATE NOT NULL,
  `policy_sum_assured` DECIMAL(15, 2) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tax_deductions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_tax_deductions_lookup` (`user_id`, `tax_year`, `deduction_date`),
  INDEX `idx_tax_deductions_code` (`deduction_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 8: tax_rules
-- Progressive tax slabs per tax year (e.g. 0%, 5%, 10%, 15%, 20%, 25%)
-- ------------------------------------------------------------
CREATE TABLE `tax_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `minimum_income` DECIMAL(15, 2) NOT NULL,
  `maximum_income` DECIMAL(15, 2) DEFAULT NULL,
  `tax_rate` DECIMAL(5, 2) NOT NULL,
  `fixed_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tax_rules_lookup` (`tax_year`, `status`, `minimum_income`),
  INDEX `idx_tax_rules_dates` (`effective_from`, `effective_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 9: tax_thresholds
-- Category-specific tax-free threshold limits (e.g. GENERAL, WOMEN, SENIOR_CITIZEN)
-- ------------------------------------------------------------
CREATE TABLE `tax_thresholds` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `tax_free_threshold` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_thresholds_year_category` (`tax_year`, `category`),
  INDEX `idx_tax_thresholds_lookup` (`tax_year`, `category`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 10: minimum_tax_rules
-- Regional minimum tax liabilities enforced by NBR (City Corp, Pourashava, etc.)
-- ------------------------------------------------------------
CREATE TABLE `minimum_tax_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `rule_type` VARCHAR(30) NOT NULL DEFAULT 'AREA_BASED',
  `area_code` VARCHAR(50) NOT NULL,
  `area_name` VARCHAR(150) NOT NULL,
  `minimum_tax_amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_minimum_tax_year_area` (`tax_year`, `area_code`),
  INDEX `idx_min_tax_rules_lookup` (`tax_year`, `area_code`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 11: tax_rebate_rules
-- Tax rebate calculation rules on allowable investments
-- Required codes: INVESTMENT_INCOME_LIMIT, INVESTMENT_ABSOLUTE_LIMIT, REBATE_RATE
-- ------------------------------------------------------------
CREATE TABLE `tax_rebate_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `rule_code` VARCHAR(50) NOT NULL,
  `rule_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `calculation_type` ENUM('PERCENTAGE', 'FIXED', 'LIMIT') NOT NULL,
  `basis_type` VARCHAR(50) NOT NULL,
  `rate` DECIMAL(5, 2) DEFAULT NULL,
  `fixed_amount` DECIMAL(15, 2) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_rebate_rules_year_code` (`tax_year`, `rule_code`),
  INDEX `idx_rebate_rules_lookup` (`tax_year`, `status`, `effective_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 12: surcharge_rules
-- Wealth surcharge brackets per tax year (Section 73 Income Tax Act 2023)
-- ------------------------------------------------------------
CREATE TABLE `surcharge_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_year` VARCHAR(20) NOT NULL,
  `rule_name` VARCHAR(150) NOT NULL,
  `minimum_wealth` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
  `maximum_wealth` DECIMAL(18, 2) DEFAULT NULL,
  `surcharge_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `effective_from` DATE NOT NULL,
  `effective_to` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_surcharge_rules_lookup` (`tax_year`, `status`, `minimum_wealth`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 13: tax_calculations
-- Final computed tax assessment headers per user and tax year
-- ------------------------------------------------------------
CREATE TABLE `tax_calculations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `tax_year` VARCHAR(20) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `total_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `taxable_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `eligible_investment` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `gross_tax` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `tax_rebate` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `tax_liability` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `salary_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `salary_exemption` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `net_tax` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `minimum_tax` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `net_wealth` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
  `surcharge_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `surcharge_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_tax_payable` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `tds_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `advance_tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `final_payable` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `calculated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tax_calculations_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_tax_calc_user_year` (`user_id`, `tax_year`),
  INDEX `idx_tax_calc_date` (`calculated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table 14: tax_calculation_details
-- Line-by-line slab tax computations for each tax calculation
-- ------------------------------------------------------------
CREATE TABLE `tax_calculation_details` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tax_calculation_id` INT UNSIGNED NOT NULL,
  `tax_rule_id` INT UNSIGNED DEFAULT NULL,
  `slab_order` INT NOT NULL,
  `minimum_income` DECIMAL(15, 2) NOT NULL,
  `maximum_income` DECIMAL(15, 2) DEFAULT NULL,
  `tax_rate` DECIMAL(5, 2) NOT NULL,
  `taxable_amount` DECIMAL(15, 2) NOT NULL,
  `calculated_tax` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_calc_details_calc` FOREIGN KEY (`tax_calculation_id`)
    REFERENCES `tax_calculations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calc_details_rule` FOREIGN KEY (`tax_rule_id`)
    REFERENCES `tax_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_calc_details_calc` (`tax_calculation_id`, `slab_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore foreign key checks
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
