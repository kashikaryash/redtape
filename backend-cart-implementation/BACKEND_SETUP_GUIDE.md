# Backend Cart Implementation Setup Guide

## Overview
This guide will help you implement the cart functionality in your Spring Boot backend to connect with your React frontend.

## Files Provided

1. **Cart.java** - Cart entity model
2. **CartItem.java** - Cart item entity model  
3. **CartRepository.java** - Cart data access layer
4. **CartItemRepository.java** - Cart item data access layer
5. **CartService.java** - Cart business logic
6. **CartController.java** - REST API endpoints
7. **database-schema.sql** - Database schema

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary tables:

```sql
-- Execute the database-schema.sql file in your MySQL database
mysql -u your_username -p your_database_name < database-schema.sql
```

### 2. Add Dependencies (if not already present)

Make sure your `pom.xml` includes these dependencies:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL Connector -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Spring Boot Starter Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### 3. Application Properties

Update your `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080

# CORS Configuration (if needed)
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3001
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

### 4. File Placement

Place the Java files in your Spring Boot project structure:

```
src/main/java/com/redtape/
├── model/
│   ├── Cart.java
│   ├── CartItem.java
│   └── Product.java (should already exist)
├── repository/
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   └── ProductRepository.java (should already exist)
├── service/
│   └── CartService.java
└── controller/
    └── CartController.java
```

### 5. Product Entity Requirements

Make sure your existing `Product.java` entity has these fields:

```java
@Entity
public class Product {
    @Id
    private String modelNo;  // This should be the primary key
    private String name;
    private Double price;
    // ... other fields
    
    // Getters and setters
}
```

### 6. ProductRepository Requirements

Your `ProductRepository` should have:

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findByModelNo(String modelNo);
}
```

## API Endpoints

Once implemented, your backend will provide these endpoints:

### Get Cart
```
GET /api/cart/getCartByUserEmail/{email}
Response: Cart object with items
```

### Add Item to Cart
```
POST /api/cart/{email}/items
Body: {
  "product": { "modelNo": "PROD001" },
  "quantity": 1
}
Response: Updated cart object
```

### Update Item Quantity
```
PUT /api/cart/{email}/items/{itemId}?quantity=2
Response: Updated cart object
```

### Remove Item
```
DELETE /api/cart/{email}/items/{itemId}
Response: Updated cart object
```

### Clear Cart
```
DELETE /api/cart/clearByEmail/{email}
Response: Empty cart object
```

### Get Cart Count
```
GET /api/cart/{email}/count
Response: { "count": 3 }
```

### Get Cart Total
```
GET /api/cart/{email}/total
Response: { "total": 299.99 }
```

## Testing

1. **Start your Spring Boot application**
2. **Test with curl or Postman**:

```bash
# Get cart for user
curl -X GET http://localhost:8080/api/cart/getCartByUserEmail/test@example.com

# Add item to cart
curl -X POST http://localhost:8080/api/cart/test@example.com/items \
  -H "Content-Type: application/json" \
  -d '{"product":{"modelNo":"TEST001"},"quantity":1}'
```

3. **Test with your React frontend** - the cart functionality should now work!

## Troubleshooting

### Common Issues:

1. **404 Errors**: Make sure the controller is in the correct package and Spring can scan it
2. **Database Errors**: Verify database connection and table creation
3. **CORS Errors**: Check CORS configuration in application.properties
4. **Product Not Found**: Ensure products exist in your database with correct modelNo

### Enable Debug Logging:

Add to `application.properties`:
```properties
logging.level.com.redtape=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Next Steps

1. Run the database schema script
2. Copy the Java files to your project
3. Update your application.properties
4. Start your Spring Boot application
5. Test the cart functionality with your React frontend

Your cart should now persist data in the database and work seamlessly with your React frontend!
