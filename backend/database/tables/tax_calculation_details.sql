CREATE TABLE tax_calculation_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tax_calculation_id INT NOT NULL,

    slab_order INT NOT NULL,

    minimum_income DECIMAL(15,2) NOT NULL,

    maximum_income DECIMAL(15,2) NULL,

    tax_rate DECIMAL(5,2) NOT NULL,

    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    calculated_tax DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tax_calculation_details_calculation
        FOREIGN KEY (tax_calculation_id)
        REFERENCES tax_calculations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);