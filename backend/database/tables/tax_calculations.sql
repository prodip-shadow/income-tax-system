CREATE TABLE tax_calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    tax_year INT NOT NULL,

    total_income DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    total_deduction DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    taxable_income DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    tax_liability DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tax_calculations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);