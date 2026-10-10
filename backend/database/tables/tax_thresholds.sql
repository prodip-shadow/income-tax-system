CREATE TABLE tax_thresholds (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,

    tax_year VARCHAR(20) NOT NULL,

    category VARCHAR(50) NOT NULL,

    tax_free_threshold DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT uq_tax_threshold_year_category
        UNIQUE (tax_year, category)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;