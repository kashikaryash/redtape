import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import baseUrl from "../../baseUrl/baseUrl";
import ProductCard from "../../ProductCard/ProductCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/CartContext";
import { useToast } from "../../components/ToastManager";
import { motion } from "framer-motion";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showCartSuccess, showCartError } = useToast();

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/products/getAllProducts`);
      console.log("Products fetched:", res.data); // Debug log
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      showCartError("Failed to fetch products.");
    }
  }, [showCartError]);

  const handleAddToCart = async (product) => {
    console.log("🛒 Add to cart clicked for:", product);
    const userEmail = localStorage.getItem('email');

    if (!userEmail) {
      console.log("❌ No user email found, redirecting to login");
      showCartError('Please login to add items to cart');
      navigate('/login');
      return;
    }

    console.log("✅ User email found:", userEmail);

    try {
      // Use CartContext's addToCart function for consistency
      await addToCart(product, 1);
      console.log("✅ Successfully added to cart via CartContext");
      showCartSuccess(product, `${product.name} added to cart!`);
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      showCartError('Failed to add product to cart: ' + error.message);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Filter products with at least one valid image
  const productsWithImages = products.filter((p) =>
    [p.img1, p.img2, p.img3, p.img4, p.img5].some((img) => img && img.trim())
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">All Products</h2>

      {productsWithImages.length === 0 ? (
        <p className="text-center">No products found.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {productsWithImages.map((product) => (
            <motion.div
              key={product.modelNo || product.id}
              className="col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProductCard
                product={product}
                onViewDetails={() => navigate(`/products/${product.modelNo}`)}
                onAddToCart={() => handleAddToCart(product)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
