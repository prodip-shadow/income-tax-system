CREATE TABLE tax_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    tax_year VARCHAR(20) NOT NULL,

    minimum_income DECIMAL(15, 2) NOT NULL,

    maximum_income DECIMAL(15, 2) NULL,

    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

    fixed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    effective_from DATE NOT NULL,

    effective_to DATE NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_tax_rule_minimum_income
        CHECK (minimum_income >= 0),

    CONSTRAINT chk_tax_rule_maximum_income
        CHECK (
            maximum_income IS NULL
            OR maximum_income > minimum_income
        ),

    CONSTRAINT chk_tax_rule_rate
        CHECK (
            tax_rate >= 0
            AND tax_rate <= 100
        ),

    CONSTRAINT chk_tax_rule_fixed_amount
        CHECK (fixed_amount >= 0),

    CONSTRAINT chk_tax_rule_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        ),

    UNIQUE (
        tax_year,
        minimum_income
    )
);