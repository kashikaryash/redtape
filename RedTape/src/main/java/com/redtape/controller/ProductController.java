package com.redtape.controller;

import com.redtape.entity.Category;
import com.redtape.entity.Product;
import com.redtape.entity.SubCategory;
import com.redtape.repository.ProductRepository;
import com.redtape.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")  // Base URL path for all product-related APIs
@RequiredArgsConstructor          // Lombok annotation to generate constructor for final fields
public class ProductController {

    private final ProductService productService;  // Service layer for business logic

    @Autowired
    private ProductRepository repository;        // Direct repository access for some queries

    // ✅ Get all products
    @GetMapping("/getAllProducts")
    public ResponseEntity<List<Product>> getAllProducts() {
        // Fetch all products and return HTTP 200 OK with list of products
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ✅ Get product by model number (primary method)
    @GetMapping("/model/{modelNo}")
    public ResponseEntity<Product> getProductByModelNo(@PathVariable Long modelNo) {
        // Find product by model number, return 200 OK if found else 404 Not Found
        return productService.getProductByModelNo(modelNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Create a new product
    @PostMapping("/createProduct")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // Add new product and return created product with 200 OK
        return ResponseEntity.ok(productService.addProduct(product));
    }

    // ✅ Create multiple products
    @PostMapping("/createProducts")
    public ResponseEntity<List<Product>> createProducts(@RequestBody List<Product> products) {
        // Add multiple products at once and return created list
        return ResponseEntity.ok(productService.addProducts(products));
    }

    // ✅ Update product details
    @PutMapping("/model/{modelNo}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long modelNo, @RequestBody Product product) {
        // Update product identified by modelNo; return updated product or 404 if not found
        return productService.updateProduct(modelNo, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Update product images only
    @PutMapping("/model/{modelNo}/images")
    public ResponseEntity<Object> updateProductImages(@PathVariable Long modelNo, @RequestBody Product imagesRequest) {
        // Update images for product with given modelNo, return updated or 404 if not found
        return productService.updateProductImages(modelNo, imagesRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete product by model number
    @DeleteMapping("/model/{modelNo}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long modelNo) {
        // Delete product, return 204 No Content regardless of existence
        productService.deleteProduct(modelNo);
        return ResponseEntity.noContent().build();
    }

    // ✅ Search products by name containing a query string
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchByName(@RequestParam String name) {
        List<Product> products = productService.searchProductsByName(name);
        // Return 204 No Content if no matches found, else 200 OK with list
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    // ✅ Filter products by category (enum type)
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable Category category) {
        List<Product> products = productService.getProductsByCategory(category);
        // Return 204 No Content if empty list, else 200 OK
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    // ✅ Filter products by subCategory (enum from String path)
    @GetMapping("/subCategory/{subCategory}")
    public ResponseEntity<List<Product>> getProductsBySubCategory(@PathVariable String subCategory) {
        try {
            // Convert String to SubCategory enum, handle invalid values with 400 Bad Request
            SubCategory subCategoryEnum = SubCategory.valueOf(subCategory.toUpperCase());
            List<Product> products = productService.getProductsBySubCategory(subCategoryEnum);
            return ResponseEntity.ok(products);
        } catch (IllegalArgumentException e) {
            // Invalid subCategory value passed
            return ResponseEntity.badRequest().body(null);
        }
    }

    // ✅ Filter products by price range (min and max prices)
    @GetMapping("/price-range")
    public ResponseEntity<List<Product>> getByPriceRange(@RequestParam double min, @RequestParam double max) {
        List<Product> products = productService.getProductsByPriceRange(min, max);
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    // ✅ Filter products by color (String match)
    @GetMapping("/color/{color}")
    public ResponseEntity<List<Product>> getByColor(@PathVariable String color) {
        List<Product> products = productService.getProductsByColor(color);
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    // ✅ Filter products by minimum available quantity
    @GetMapping("/min-quantity")
    public ResponseEntity<List<Product>> getByMinimumQuantity(@RequestParam int minQuantity) {
        List<Product> products = productService.getProductsByMinQuantity(minQuantity);
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    // ✅ Filter products by category AND sub-category together (uses repository directly)
    @GetMapping("/catAndSubCat/{category}/{subCategory}")
    public List<Product> getProdbyCatAndSubCat(@PathVariable String category,
                                               @PathVariable String subCategory) {
        SubCategory subCate = SubCategory.valueOf(subCategory.toUpperCase());
        Category cate = Category.valueOf(category.toUpperCase());
        return repository.findByCategoryAndSubCategory(cate, subCate);
    }
    
    // ✅ Provide product name suggestions based on a query string (autocomplete feature)
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String query) {
        List<String> suggestions = productService.getProductNameSuggestions(query);
        return suggestions.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(suggestions);
    }
}
