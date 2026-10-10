CREATE TABLE expense_types (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    expense_code VARCHAR(50) NOT NULL,
    expense_name VARCHAR(150) NOT NULL,

    expense_category ENUM(
        'BUSINESS',
        'PERSONAL'
    ) NOT NULL,

    description VARCHAR(255) DEFAULT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) NOT NULL DEFAULT 'ACTIVE',

    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_expense_code (
        expense_code
    ),

    CONSTRAINT chk_expense_type_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        )

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;