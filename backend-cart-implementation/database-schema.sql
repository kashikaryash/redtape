-- Cart Database Schema
-- Run this SQL script to create the necessary tables for cart functionality

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_model_no VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_model_no) REFERENCES products(model_no) ON DELETE CASCADE,
    
    UNIQUE KEY unique_cart_product (cart_id, product_model_no),
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_model_no (product_model_no)
);

-- Add indexes for better performance
CREATE INDEX idx_carts_user_email ON carts(user_email);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_model_no ON cart_items(product_model_no);

-- Sample data (optional - for testing)
-- INSERT INTO carts (user_email) VALUES ('test@example.com');
-- INSERT INTO cart_items (cart_id, product_model_no, quantity) VALUES (1, 'TEST001', 2);
