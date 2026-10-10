CREATE TABLE tax_deductions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    tax_year VARCHAR(20) NOT NULL,

    deduction_code VARCHAR(50) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    description VARCHAR(255) DEFAULT NULL,

    deduction_date DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_tax_deductions_user_year (
        user_id,
        tax_year
    ),

    INDEX idx_tax_deductions_code (
        deduction_code
    ),

    CONSTRAINT chk_tax_deduction_amount
        CHECK (amount >= 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;