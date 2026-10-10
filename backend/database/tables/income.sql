USE income_tax_system;

CREATE TABLE income (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    income_type VARCHAR(50) NOT NULL,

    source_name VARCHAR(150) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    income_date DATE NOT NULL,

    description TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);