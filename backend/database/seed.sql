-- ============================================================
-- Income Tax Calculation & Filing System
-- Mock / Seed Data (seed.sql)
-- Target RDBMS: MySQL / MariaDB (phpMyAdmin Compatible)
-- Database Name: income_tax_system
-- ============================================================

USE `income_tax_system`;

-- Disable foreign keys for safe, repeatable seed execution
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE `tax_calculation_details`;
TRUNCATE TABLE `tax_calculations`;
TRUNCATE TABLE `tax_deductions`;
TRUNCATE TABLE `expenses`;
TRUNCATE TABLE `income`;
TRUNCATE TABLE `taxpayer_profiles`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `tax_rebate_rules`;
TRUNCATE TABLE `minimum_tax_rules`;
TRUNCATE TABLE `tax_thresholds`;
TRUNCATE TABLE `tax_rules`;
TRUNCATE TABLE `tax_deduction_rules`;
TRUNCATE TABLE `expense_types`;

-- ============================================================
-- 1. USERS
-- Default password for all users: 12345678
-- Bcrypt Hash: $2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe
-- ============================================================
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `nid`, `role`, `is_verified`, `created_at`) VALUES
(1, 'System Administrator', 'admin@taxsystem.gov.bd', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01700000001', '19901234567890001', 'admin', 1, NOW()),
(2, 'Rafy Hossain', 'rafy@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01711112233', '19951234567890002', 'admin', 1, NOW()),
(3, 'Fatema Begum', 'fatema@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01811112233', '19921234567890003', 'user', 1, NOW()),
(4, 'Md. Abdul Karim', 'karim@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01911112233', '19581234567890004', 'user', 1, NOW()),
(5, 'Tanvir Ahmed', 'tanvir@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01611112233', '19711234567890005', 'user', 1, NOW()),
(6, 'Nadia Sultana', 'nadia@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01511112233', '19981234567890006', 'user', 1, NOW()),
(7, 'Sabbir Rahman', 'sabbir@example.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '01311112233', '20011234567890007', 'user', 1, NOW()),
(8, 'Rafy', 'rafy@gmail.com', '$2b$10$9P7BgN/1DrgRUUTGzzLdxerIQ3jlPvWIzd5wCIegpk/FB6Kj1.ihe', '0178403430', '51877622', 'admin', 1, NOW());


-- ============================================================
-- 2. EXPENSE TYPES (Master Catalog)
-- Categories: BUSINESS (Tax-deductible), PERSONAL
-- ============================================================
INSERT INTO `expense_types` (`id`, `expense_code`, `expense_name`, `expense_category`, `description`, `status`, `effective_from`, `effective_to`) VALUES
(1, 'OFFICE_RENT', 'Office Space Rent', 'BUSINESS', 'Commercial office space rental fee', 'ACTIVE', '2024-01-01', NULL),
(2, 'STAFF_SALARY', 'Employee Salaries & Wages', 'BUSINESS', 'Remuneration paid to staff members', 'ACTIVE', '2024-01-01', NULL),
(3, 'UTILITY_BUSINESS', 'Commercial Utilities', 'BUSINESS', 'Electricity, water, and internet bills for office', 'ACTIVE', '2024-01-01', NULL),
(4, 'MARKETING', 'Advertising & Marketing', 'BUSINESS', 'Promotion, online advertising, and campaigns', 'ACTIVE', '2024-01-01', NULL),
(5, 'OFFICE_SUPPLIES', 'Office Supplies & Stationery', 'BUSINESS', 'Stationery, paper, toner, and small consumables', 'ACTIVE', '2024-01-01', NULL),
(6, 'TRAVEL_BUSINESS', 'Official Travel & Conveyance', 'BUSINESS', 'Business-related local and domestic travel expenses', 'ACTIVE', '2024-01-01', NULL),
(7, 'PROFESSIONAL_FEES', 'Legal & Professional Consultancy', 'BUSINESS', 'Legal advisory, audit, and tax consulting fees', 'ACTIVE', '2024-01-01', NULL),
(8, 'EQUIPMENT_MAINTENANCE', 'Equipment Repair & Maintenance', 'BUSINESS', 'Computer, machinery, and office furniture upkeep', 'ACTIVE', '2024-01-01', NULL),
(9, 'HOME_RENT', 'Residential House Rent', 'PERSONAL', 'Monthly home rent for residence', 'ACTIVE', '2024-01-01', NULL),
(10, 'FAMILY_EXPENSE', 'Family Living & Groceries', 'PERSONAL', 'Household food, groceries, and daily commodities', 'ACTIVE', '2024-01-01', NULL),
(11, 'CHILD_EDUCATION', 'Children Education Expenses', 'PERSONAL', 'School tuition, college fees, books, and uniforms', 'ACTIVE', '2024-01-01', NULL),
(12, 'MEDICAL_PERSONAL', 'Personal & Family Healthcare', 'PERSONAL', 'Doctor visits, medical tests, and medicines', 'ACTIVE', '2024-01-01', NULL),
(13, 'UTILITY_RESIDENTIAL', 'Residential Utility Bills', 'PERSONAL', 'Home electricity, gas, and water bills', 'ACTIVE', '2024-01-01', NULL),
(14, 'ENTERTAINMENT_PERSONAL', 'Leisure & Entertainment', 'PERSONAL', 'Dining, vacation, and recreational activities', 'ACTIVE', '2024-01-01', NULL);

-- ============================================================
-- 3. MINIMUM TAX RULES
-- Regional minimum tax liabilities enforced by NBR
-- ============================================================
INSERT INTO `minimum_tax_rules` (`id`, `tax_year`, `rule_type`, `area_code`, `area_name`, `minimum_tax_amount`, `status`, `effective_from`, `effective_to`) VALUES
-- 2024-25 (Area-based)
(1, '2024-25', 'AREA_BASED', 'DHAKA_NORTH', 'Dhaka North City Corporation', 5000.00, 'ACTIVE', '2024-07-01', NULL),
(2, '2024-25', 'AREA_BASED', 'DHAKA_SOUTH', 'Dhaka South City Corporation', 5000.00, 'ACTIVE', '2024-07-01', NULL),
(3, '2024-25', 'AREA_BASED', 'CHATTOGRAM', 'Chattogram City Corporation', 5000.00, 'ACTIVE', '2024-07-01', NULL),
(4, '2024-25', 'AREA_BASED', 'OTHER_CITY', 'Other City Corporations', 4000.00, 'ACTIVE', '2024-07-01', NULL),
(5, '2024-25', 'AREA_BASED', 'POURASHAVA', 'District Municipalities (Pourashava)', 3000.00, 'ACTIVE', '2024-07-01', NULL),
(6, '2024-25', 'AREA_BASED', 'OTHER_AREA', 'Other Areas / Rural Regions', 3000.00, 'ACTIVE', '2024-07-01', NULL),
-- 2025-26 (Taxpayer-based & Area-based)
(7, '2025-26', 'TAXPAYER_TYPE', 'REGULAR_TAXPAYER', 'Regular Taxpayer (নিয়মিত করদাতা - জাতীয়ভাবে)', 5000.00, 'ACTIVE', '2025-07-01', NULL),
(8, '2025-26', 'TAXPAYER_TYPE', 'NEW_TAXPAYER', 'New / First-Time Taxpayer (নতুন করদাতা - ১ম বার দাখিলকারী)', 1000.00, 'ACTIVE', '2025-07-01', NULL),
(9, '2025-26', 'AREA_BASED', 'DHAKA_NORTH', 'Dhaka North City Corporation', 5000.00, 'ACTIVE', '2025-07-01', NULL),
(10, '2025-26', 'AREA_BASED', 'DHAKA_SOUTH', 'Dhaka South City Corporation', 5000.00, 'ACTIVE', '2025-07-01', NULL),
(11, '2025-26', 'AREA_BASED', 'CHATTOGRAM', 'Chattogram City Corporation', 5000.00, 'ACTIVE', '2025-07-01', NULL),
(12, '2025-26', 'AREA_BASED', 'OTHER_CITY', 'Other City Corporations', 4000.00, 'ACTIVE', '2025-07-01', NULL),
(13, '2025-26', 'AREA_BASED', 'POURASHAVA', 'District Municipalities (Pourashava)', 3000.00, 'ACTIVE', '2025-07-01', NULL),
(14, '2025-26', 'AREA_BASED', 'OTHER_AREA', 'Other Areas / Rural Regions', 3000.00, 'ACTIVE', '2025-07-01', NULL),
-- 2026-27 (Current Active Tax Year - Taxpayer-based & Area-based)
(15, '2026-27', 'TAXPAYER_TYPE', 'REGULAR_TAXPAYER', 'Regular Taxpayer (নিয়মিত করদাতা - জাতীয়ভাবে)', 5000.00, 'ACTIVE', '2026-07-01', NULL),
(16, '2026-27', 'TAXPAYER_TYPE', 'NEW_TAXPAYER', 'New / First-Time Taxpayer (নতুন করদাতা - ১ম বার দাখিলকারী)', 1000.00, 'ACTIVE', '2026-07-01', NULL),
(17, '2026-27', 'AREA_BASED', 'DHAKA_NORTH', 'Dhaka North City Corporation', 5000.00, 'ACTIVE', '2026-07-01', NULL),
(18, '2026-27', 'AREA_BASED', 'DHAKA_SOUTH', 'Dhaka South City Corporation', 5000.00, 'ACTIVE', '2026-07-01', NULL),
(19, '2026-27', 'AREA_BASED', 'CHATTOGRAM', 'Chattogram City Corporation', 5000.00, 'ACTIVE', '2026-07-01', NULL),
(20, '2026-27', 'AREA_BASED', 'OTHER_CITY', 'Other City Corporations', 4000.00, 'ACTIVE', '2026-07-01', NULL),
(21, '2026-27', 'AREA_BASED', 'POURASHAVA', 'District Municipalities (Pourashava)', 3000.00, 'ACTIVE', '2026-07-01', NULL),
(22, '2026-27', 'AREA_BASED', 'OTHER_AREA', 'Other Areas / Rural Regions', 3000.00, 'ACTIVE', '2026-07-01', NULL);

-- ============================================================
-- 4. TAX THRESHOLDS
-- Tax-free exemption limits per demographic category
-- ============================================================
INSERT INTO `tax_thresholds` (`id`, `tax_year`, `category`, `tax_free_threshold`, `status`, `effective_from`, `effective_to`) VALUES
-- 2024-25
(1, '2024-25', 'GENERAL', 350000.00, 'ACTIVE', '2024-07-01', NULL),
(2, '2024-25', 'WOMEN', 400000.00, 'ACTIVE', '2024-07-01', NULL),
(3, '2024-25', 'SENIOR_CITIZEN', 400000.00, 'ACTIVE', '2024-07-01', NULL),
(4, '2024-25', 'PHYSICALLY_CHALLENGED', 475000.00, 'ACTIVE', '2024-07-01', NULL),
(5, '2024-25', 'THIRD_GENDER', 475000.00, 'ACTIVE', '2024-07-01', NULL),
(6, '2024-25', 'WAR_WOUNDED_FREEDOM_FIGHTER', 500000.00, 'ACTIVE', '2024-07-01', NULL),
(7, '2024-25', 'JULY_WARRIOR', 500000.00, 'ACTIVE', '2024-07-01', NULL),
-- 2025-26
(8, '2025-26', 'GENERAL', 375000.00, 'ACTIVE', '2025-07-01', NULL),
(9, '2025-26', 'WOMEN', 425000.00, 'ACTIVE', '2025-07-01', NULL),
(10, '2025-26', 'SENIOR_CITIZEN', 425000.00, 'ACTIVE', '2025-07-01', NULL),
(11, '2025-26', 'PHYSICALLY_CHALLENGED', 500000.00, 'ACTIVE', '2025-07-01', NULL),
(12, '2025-26', 'THIRD_GENDER', 500000.00, 'ACTIVE', '2025-07-01', NULL),
(13, '2025-26', 'WAR_WOUNDED_FREEDOM_FIGHTER', 525000.00, 'ACTIVE', '2025-07-01', NULL),
(14, '2025-26', 'JULY_WARRIOR', 525000.00, 'ACTIVE', '2025-07-01', NULL),
-- 2026-27 (Current Active Tax Year)
(15, '2026-27', 'GENERAL', 400000.00, 'ACTIVE', '2026-07-01', NULL),
(16, '2026-27', 'WOMEN', 450000.00, 'ACTIVE', '2026-07-01', NULL),
(17, '2026-27', 'SENIOR_CITIZEN', 450000.00, 'ACTIVE', '2026-07-01', NULL),
(18, '2026-27', 'PHYSICALLY_CHALLENGED', 500000.00, 'ACTIVE', '2026-07-01', NULL),
(19, '2026-27', 'THIRD_GENDER', 500000.00, 'ACTIVE', '2026-07-01', NULL),
(20, '2026-27', 'WAR_WOUNDED_FREEDOM_FIGHTER', 525000.00, 'ACTIVE', '2026-07-01', NULL),
(21, '2026-27', 'JULY_WARRIOR', 525000.00, 'ACTIVE', '2026-07-01', NULL);

-- ============================================================
-- 5. TAX RULES (Progressive Tax Slabs - ধারা ৪৫ ও ১ম তফসিল)
-- Finance Act 2024 restored the 30% top slab for income above 38.5L / 35.75L / 36L
-- ============================================================
INSERT INTO `tax_rules` (`id`, `tax_year`, `minimum_income`, `maximum_income`, `tax_rate`, `fixed_amount`, `status`, `effective_from`, `effective_to`) VALUES
-- 2024-25 Slabs (Finance Act 2024)
(1, '2024-25', 0.00, 350000.00, 0.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(2, '2024-25', 350000.00, 450000.00, 5.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(3, '2024-25', 450000.00, 850000.00, 10.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(4, '2024-25', 850000.00, 1350000.00, 15.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(5, '2024-25', 1350000.00, 1850000.00, 20.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(6, '2024-25', 1850000.00, 3850000.00, 25.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
(7, '2024-25', 3850000.00, NULL, 30.00, 0.00, 'ACTIVE', '2024-07-01', NULL),
-- 2025-26 Slabs (Streamlined Slabs)
(8, '2025-26', 0.00, 375000.00, 0.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
(9, '2025-26', 375000.00, 675000.00, 10.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
(10, '2025-26', 675000.00, 1075000.00, 15.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
(11, '2025-26', 1075000.00, 1575000.00, 20.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
(12, '2025-26', 1575000.00, 3575000.00, 25.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
(13, '2025-26', 3575000.00, NULL, 30.00, 0.00, 'ACTIVE', '2025-07-01', NULL),
-- 2026-27 Slabs (Finance Act 2026)
(14, '2026-27', 0.00, 400000.00, 0.00, 0.00, 'ACTIVE', '2026-07-01', NULL),
(15, '2026-27', 400000.00, 700000.00, 10.00, 0.00, 'ACTIVE', '2026-07-01', NULL),
(16, '2026-27', 700000.00, 1100000.00, 15.00, 0.00, 'ACTIVE', '2026-07-01', NULL),
(17, '2026-27', 1100000.00, 1600000.00, 20.00, 0.00, 'ACTIVE', '2026-07-01', NULL),
(18, '2026-27', 1600000.00, 3600000.00, 25.00, 0.00, 'ACTIVE', '2026-07-01', NULL),
(19, '2026-27', 3600000.00, NULL, 30.00, 0.00, 'ACTIVE', '2026-07-01', NULL);

-- ============================================================
-- 6. TAX REBATE RULES (ধারা ৭৮ আয়কর আইন ২০২৩)
-- Rebate is the lowest of:
-- 1) 3% of Total Taxable Income (INVESTMENT_INCOME_LIMIT)
-- 2) 15% (10% in 2026-27) of Actual Eligible Investment (REBATE_RATE)
-- 3) Statutory Ceiling Cap BDT 1,000,000 (750,000 in 2026-27) (INVESTMENT_ABSOLUTE_LIMIT)
-- ============================================================
INSERT INTO `tax_rebate_rules` (`id`, `tax_year`, `rule_code`, `rule_name`, `description`, `calculation_type`, `basis_type`, `rate`, `fixed_amount`, `status`, `effective_from`, `effective_to`) VALUES
-- 2024-25
(1, '2024-25', 'INVESTMENT_INCOME_LIMIT', 'Income-Based Investment Limit', 'Maximum 3% of total taxable income under Section 78', 'PERCENTAGE', 'TAXABLE_INCOME', 3.00, NULL, 'ACTIVE', '2024-07-01', NULL),
(2, '2024-25', 'INVESTMENT_ABSOLUTE_LIMIT', 'Absolute Maximum Investment Cap', 'Maximum allowable tax rebate ceiling cap of BDT 1,000,000', 'LIMIT', 'CONSTANT', NULL, 1000000.00, 'ACTIVE', '2024-07-01', NULL),
(3, '2024-25', 'REBATE_RATE', 'General Investment Rebate Rate', '15% tax rebate on allowable eligible investments', 'PERCENTAGE', 'ALLOWABLE_INVESTMENT', 15.00, NULL, 'ACTIVE', '2024-07-01', NULL),
-- 2025-26
(4, '2025-26', 'INVESTMENT_INCOME_LIMIT', 'Income-Based Investment Limit', 'Maximum 3% of total taxable income under Section 78', 'PERCENTAGE', 'TAXABLE_INCOME', 3.00, NULL, 'ACTIVE', '2025-07-01', NULL),
(5, '2025-26', 'INVESTMENT_ABSOLUTE_LIMIT', 'Absolute Maximum Investment Cap', 'Maximum allowable tax rebate ceiling cap of BDT 1,000,000', 'LIMIT', 'CONSTANT', NULL, 1000000.00, 'ACTIVE', '2025-07-01', NULL),
(6, '2025-26', 'REBATE_RATE', 'General Investment Rebate Rate', '15% tax rebate on allowable eligible investments', 'PERCENTAGE', 'ALLOWABLE_INVESTMENT', 15.00, NULL, 'ACTIVE', '2025-07-01', NULL),
-- 2026-27 (Current Active Tax Year - Finance Act 2026 amendments)
(7, '2026-27', 'INVESTMENT_INCOME_LIMIT', 'Income-Based Investment Limit', 'Maximum 3% of total taxable income under Section 78', 'PERCENTAGE', 'TAXABLE_INCOME', 3.00, NULL, 'ACTIVE', '2026-07-01', NULL),
(8, '2026-27', 'INVESTMENT_ABSOLUTE_LIMIT', 'Absolute Maximum Investment Cap', 'Statutory maximum tax rebate cap of BDT 750,000', 'LIMIT', 'CONSTANT', NULL, 750000.00, 'ACTIVE', '2026-07-01', NULL),
(9, '2026-27', 'REBATE_RATE', 'General Investment Rebate Rate', '10% tax rebate on allowable eligible investments', 'PERCENTAGE', 'ALLOWABLE_INVESTMENT', 10.00, NULL, 'ACTIVE', '2026-07-01', NULL);

-- ============================================================
-- 7. TAX DEDUCTION RULES (Eligible Investment Instruments)
-- ============================================================
INSERT INTO `tax_deduction_rules` (`id`, `tax_year`, `deduction_code`, `deduction_name`, `description`, `income_type`, `calculation_type`, `deduction_rate`, `maximum_amount`, `status`, `effective_from`, `effective_to`) VALUES
-- 2024-25
(1, '2024-25', 'DPS', 'Deposit Pension Scheme (DPS)', 'Annual contribution to scheduled bank DPS up to ৳120,000', NULL, 'LIMITED', 0.00, 120000.00, 'ACTIVE', '2024-07-01', NULL),
(2, '2024-25', 'LIFE_INSURANCE', 'Life Insurance Premium', 'Annual premium paid on life insurance policy', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2024-07-01', NULL),
(3, '2024-25', 'GOVT_SECURITIES', 'Government Treasury Bonds & Sanchayapatra', 'Investment in approved government savings certificates', NULL, 'LIMITED', 0.00, 500000.00, 'ACTIVE', '2024-07-01', NULL),
(4, '2024-25', 'STOCK_INVESTMENT', 'Listed Securities & Mutual Funds', 'Investment in approved shares and mutual fund units', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2024-07-01', NULL),
(5, '2024-25', 'BENEVOLENT_FUND', 'Benevolent Fund & Group Insurance', 'Mandatory payroll deductions for benevolent fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2024-07-01', NULL),
(6, '2024-25', 'ZAKAT', 'Approved Zakat Fund Donation', 'Donation paid directly to government approved Zakat fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2024-07-01', NULL),
-- 2025-26
(7, '2025-26', 'DPS', 'Deposit Pension Scheme (DPS)', 'Annual contribution to scheduled bank DPS up to ৳120,000', NULL, 'LIMITED', 0.00, 120000.00, 'ACTIVE', '2025-07-01', NULL),
(8, '2025-26', 'LIFE_INSURANCE', 'Life Insurance Premium', 'Annual premium paid on life insurance policy', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2025-07-01', NULL),
(9, '2025-26', 'GOVT_SECURITIES', 'Government Treasury Bonds & Sanchayapatra', 'Investment in approved government savings certificates', NULL, 'LIMITED', 0.00, 500000.00, 'ACTIVE', '2025-07-01', NULL),
(10, '2025-26', 'STOCK_INVESTMENT', 'Listed Securities & Mutual Funds', 'Investment in approved shares and mutual fund units', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2025-07-01', NULL),
(11, '2025-26', 'BENEVOLENT_FUND', 'Benevolent Fund & Group Insurance', 'Mandatory payroll deductions for benevolent fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2025-07-01', NULL),
(12, '2025-26', 'ZAKAT', 'Approved Zakat Fund Donation', 'Donation paid directly to government approved Zakat fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2025-07-01', NULL),
-- 2026-27 (Current Active Tax Year)
(13, '2026-27', 'DPS', 'Deposit Pension Scheme (DPS)', 'Annual contribution to scheduled bank DPS up to ৳120,000', NULL, 'LIMITED', 0.00, 120000.00, 'ACTIVE', '2026-07-01', NULL),
(14, '2026-27', 'LIFE_INSURANCE', 'Life Insurance Premium', 'Annual premium paid on life insurance policy', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2026-07-01', NULL),
(15, '2026-27', 'GOVT_SECURITIES', 'Government Treasury Bonds & Sanchayapatra', 'Investment in approved government savings certificates', NULL, 'LIMITED', 0.00, 500000.00, 'ACTIVE', '2026-07-01', NULL),
(16, '2026-27', 'STOCK_INVESTMENT', 'Listed Securities & Mutual Funds', 'Investment in approved shares and mutual fund units', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2026-07-01', NULL),
(17, '2026-27', 'BENEVOLENT_FUND', 'Benevolent Fund & Group Insurance', 'Mandatory payroll deductions for benevolent fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2026-07-01', NULL),
(18, '2026-27', 'ZAKAT', 'Approved Zakat Fund Donation', 'Donation paid directly to government approved Zakat fund', NULL, 'ACTUAL', 0.00, NULL, 'ACTIVE', '2026-07-01', NULL);

-- ============================================================
-- 8. TAXPAYER PROFILES
-- ============================================================
INSERT INTO `taxpayer_profiles` (`id`, `user_id`, `date_of_birth`, `gender`, `minimum_tax_area`, `is_new_taxpayer`, `is_physically_challenged`, `disabled_child_dependents`, `is_freedom_fighter`, `is_july_warrior`) VALUES
(1, 2, '1995-04-15', 'MALE', 'DHAKA_NORTH', 0, 0, 0, 0, 0),
(2, 3, '1992-08-20', 'FEMALE', 'CHATTOGRAM', 1, 0, 1, 0, 0),
(3, 4, '1958-01-10', 'MALE', 'OTHER_CITY', 0, 0, 0, 0, 0),
(4, 5, '1971-12-16', 'MALE', 'OTHER_AREA', 0, 0, 0, 1, 0),
(5, 6, '1998-03-25', 'FEMALE', 'DHAKA_SOUTH', 1, 1, 0, 0, 0),
(6, 7, '2001-07-15', 'MALE', 'POURASHAVA', 1, 0, 0, 0, 1);

-- ============================================================
-- 9. INCOME RECORDS
-- Income period for tax year 2026-27: 2026-07-01 to 2027-06-30
-- ============================================================
INSERT INTO `income` (`id`, `user_id`, `income_type`, `source_name`, `amount`, `income_date`, `description`) VALUES
-- User 2: Rafy Hossain (Total income: 475,000.00)
(1, 2, 'SALARY', 'Tech Solutions Ltd (July Salary)', 100000.00, '2026-07-05', 'Monthly basic and allowances for July 2026'),
(2, 2, 'SALARY', 'Tech Solutions Ltd (August Salary)', 100000.00, '2026-08-05', 'Monthly basic and allowances for August 2026'),
(3, 2, 'SALARY', 'Tech Solutions Ltd (September Salary)', 100000.00, '2026-09-05', 'Monthly basic and allowances for September 2026'),
(4, 2, 'SALARY', 'Tech Solutions Ltd (October Salary)', 100000.00, '2026-10-05', 'Monthly basic and allowances for October 2026'),
(5, 2, 'PROFESSIONAL', 'Freelance Software Consultation', 50000.00, '2026-08-15', 'API architecture consultancy project'),
(6, 2, 'DIVIDEND', 'Dhaka Stock Exchange Portfolio', 25000.00, '2026-09-20', 'Annual cash dividend distribution'),

-- User 3: Fatema Begum (Total income: 340,000.00)
(7, 3, 'SALARY', 'Apex Technologies (July Salary)', 85000.00, '2026-07-10', 'Monthly salary for July 2026'),
(8, 3, 'SALARY', 'Apex Technologies (August Salary)', 85000.00, '2026-08-10', 'Monthly salary for August 2026'),
(9, 3, 'SALARY', 'Apex Technologies (September Salary)', 85000.00, '2026-09-10', 'Monthly salary for September 2026'),
(10, 3, 'SALARY', 'Apex Technologies (October Salary)', 85000.00, '2026-10-10', 'Monthly salary for October 2026'),

-- User 4: Md. Abdul Karim (Senior Citizen)
(11, 4, 'PENSION', 'Government Pension Cell', 60000.00, '2026-07-01', 'Monthly retirement pension payment'),
(12, 4, 'PENSION', 'Government Pension Cell', 60000.00, '2026-08-01', 'Monthly retirement pension payment'),
(13, 4, 'PENSION', 'Government Pension Cell', 60000.00, '2026-09-01', 'Monthly retirement pension payment'),
(14, 4, 'HOUSE_RENT', 'Commercial Property Lease (Sylhet)', 45000.00, '2026-07-15', 'Rental income from commercial floor space'),
(15, 4, 'HOUSE_RENT', 'Commercial Property Lease (Sylhet)', 45000.00, '2026-08-15', 'Rental income from commercial floor space'),

-- User 5: Tanvir Ahmed (Freedom Fighter)
(16, 5, 'SALARY', 'National Logistics Ltd', 90000.00, '2026-07-05', 'Monthly managerial salary'),
(17, 5, 'SALARY', 'National Logistics Ltd', 90000.00, '2026-08-05', 'Monthly managerial salary'),
(18, 5, 'AGRICULTURE', 'Agricultural Farm Harvest', 50000.00, '2026-09-15', 'Paddy and fruits harvest sales revenue');

-- ============================================================
-- 10. EXPENSE RECORDS
-- User 2 Business Deductible Expenses: 25k + 5k + 15k = 45,000.00
-- ============================================================
INSERT INTO `expenses` (`id`, `user_id`, `expense_type_id`, `expense_type`, `expense_category`, `is_tax_deductible`, `description`, `amount`, `expense_date`) VALUES
-- User 2 Business Expenses (Deductible = 1)
(1, 2, 1, 'Office Space Rent', 'BUSINESS', 1, 'Rent for Banani developer workspace', 25000.00, '2026-07-12'),
(2, 2, 3, 'Commercial Utilities', 'BUSINESS', 1, 'Broadband fiber internet & power supply', 5000.00, '2026-08-15'),
(3, 2, 7, 'Legal & Professional Consultancy', 'BUSINESS', 1, 'Annual accounting & tax submission fee', 15000.00, '2026-09-18'),

-- User 2 Personal Expenses (Deductible = 0)
(4, 2, 9, 'Residential House Rent', 'PERSONAL', 0, 'Personal apartment rental in Mirpur', 20000.00, '2026-07-20'),
(5, 2, 10, 'Family Living & Groceries', 'PERSONAL', 0, 'Monthly household groceries and supplies', 18000.00, '2026-08-25'),

-- User 3 Personal Expenses
(6, 3, 9, 'Residential House Rent', 'PERSONAL', 0, 'Apartment rent in Chattogram Nasirabad', 18000.00, '2026-07-22'),
(7, 3, 11, 'Children Education Expenses', 'PERSONAL', 0, 'School tuition fee for daughter', 12000.00, '2026-08-05');

-- ============================================================
-- 11. TAX DEDUCTIONS / INVESTMENTS
-- User 2 Eligible Investments: DPS (60k) + Life Ins (30k) + Govt Sec (50k) = 140,000.00
-- ============================================================
INSERT INTO `tax_deductions` (`id`, `user_id`, `tax_year`, `deduction_code`, `amount`, `description`, `deduction_date`) VALUES
(1, 2, '2026-27', 'DPS', 60000.00, 'BRAC Bank monthly Deposit Pension Scheme', '2026-07-15'),
(2, 2, '2026-27', 'LIFE_INSURANCE', 30000.00, 'MetLife Bangladesh annual life policy premium', '2026-08-20'),
(3, 2, '2026-27', 'GOVT_SECURITIES', 50000.00, '5-Year Bangladesh Sanchayapatra bond purchase', '2026-09-10'),

(4, 3, '2026-27', 'DPS', 40000.00, 'City Bank DPS investment contribution', '2026-07-25'),
(5, 3, '2026-27', 'LIFE_INSURANCE', 20000.00, 'Delta Life insurance policy premium', '2026-08-15'),

(6, 4, '2026-27', 'GOVT_SECURITIES', 100000.00, 'Pensioner Sanchayapatra certificate', '2026-07-18');

-- ============================================================
-- 12. TAX CALCULATIONS (Verified Pre-computed Sample)
-- For User 2 (Rafy Hossain):
-- Total Income: 475,000.00
-- Business Deduction: 45,000.00
-- Taxable Income: 430,000.00
-- General Threshold: 375,000.00
-- Taxable Slabs:
--   Slab 1: 0 to 375,000 @ 0% -> Tax = 0.00
--   Slab 2: 375,000 to 430,000 (55,000) @ 5% -> Tax = 2,750.00
-- Gross Tax: 2,750.00
-- Eligible Investment: 140,000.00
-- Rebate Limit: min(430k*20%=86k, 140k*15%=21k, 1M cap) = 21,000.00
-- Tax Rebate: min(21k, 2750) = 2,750.00
-- Tax After Rebate: 0.00
-- Area: DHAKA_NORTH (Minimum Tax: 5,000.00)
-- Final Tax Liability: 5,000.00 (Minimum tax applied)
-- ============================================================
INSERT INTO `tax_calculations` (`id`, `user_id`, `tax_year`, `category`, `total_income`, `total_deduction`, `taxable_income`, `eligible_investment`, `gross_tax`, `tax_rebate`, `tax_liability`, `calculated_at`) VALUES
(1, 2, '2026-27', 'GENERAL', 475000.00, 45000.00, 430000.00, 140000.00, 2750.00, 2750.00, 5000.00, NOW());

-- ============================================================
-- 13. TAX CALCULATION DETAILS
-- ============================================================
INSERT INTO `tax_calculation_details` (`id`, `tax_calculation_id`, `tax_rule_id`, `slab_order`, `minimum_income`, `maximum_income`, `tax_rate`, `taxable_amount`, `calculated_tax`, `created_at`) VALUES
(1, 1, 14, 1, 375000.00, 430000.00, 5.00, 55000.00, 2750.00, NOW());

-- Restore foreign key checks
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
