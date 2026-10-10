USE income_tax_system;

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    expense_type VARCHAR(100) NOT NULL,

    description VARCHAR(255),

    amount DECIMAL(15,2) NOT NULL,

    expense_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);