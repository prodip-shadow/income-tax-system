CREATE TABLE tax_deduction_rules (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,

    tax_year VARCHAR(20) NOT NULL,

    deduction_code VARCHAR(50) NOT NULL,

    deduction_name VARCHAR(255) NOT NULL,

    description TEXT NULL,

    income_type VARCHAR(100) NULL,

    calculation_type ENUM(
        'FIXED',
        'PERCENTAGE',
        'LIMITED',
        'ACTUAL'
    ) NOT NULL DEFAULT 'ACTUAL',

    deduction_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    maximum_amount DECIMAL(15,2) DEFAULT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) NOT NULL DEFAULT 'ACTIVE',

    effective_from DATE NOT NULL,

    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_tax_deduction_code_year (
        tax_year,
        deduction_code
    ),

    CONSTRAINT chk_deduction_rate
        CHECK (
            deduction_rate >= 0
            AND deduction_rate <= 100
        ),

    CONSTRAINT chk_deduction_maximum
        CHECK (
            maximum_amount IS NULL
            OR maximum_amount >= 0
        ),

    CONSTRAINT chk_deduction_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        )

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;