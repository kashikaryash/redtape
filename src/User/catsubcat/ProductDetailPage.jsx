import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from '../../components/CartContext';
import { toast } from 'react-toastify';

function ProductDetailPage() {
  const { modelNo } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/products/model/${modelNo}`)
      .then((res) => {
        setProduct(res.data);
        setMainImage(res.data.img1);
      })
      .catch((err) => console.error("Failed to fetch product:", err));
  }, [modelNo]);

  const handleAddToCart = async () => {
    const userEmail = localStorage.getItem('email');

    if (!userEmail) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product, 1); // Using CartContext
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    const userEmail = localStorage.getItem('email');

    if (!userEmail) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product, 1); // Using CartContext
      navigate('/checkout');
    } catch (err) {
      console.error("Buy now failed:", err);
      toast.error('Failed to process your request');
    }
  };

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container py-5">
      <div className="row g-5">

        {/* Left: Product Images */}
        <div className="col-md-6">
          <div className="border rounded shadow-sm p-3">
            <img src={mainImage} alt="Main" className="img-fluid rounded mb-3" />
            <div className="d-flex flex-wrap gap-2">
              {[product.img1, product.img2, product.img3, product.img4, product.img5]
                .filter(Boolean)
                .map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`View ${i}`}
                    className="img-thumbnail"
                    style={{ width: '75px', height: '75px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setMainImage(img)}
                  />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="col-md-6">
          <div className="border rounded shadow-sm p-4 bg-white">
            <h2 className="mb-3">{product.name}</h2>
            <p className="text-muted mb-1"><strong>Brand:</strong> {product.brand}</p>
            <p className="text-muted mb-1"><strong>Color:</strong> {product.color}</p>
            <h4 className="text-danger mt-3 mb-2">
              ₹{product.price}
            </h4>

            <p className="text-secondary mb-4">{product.description}</p>

            <div className="d-flex flex-wrap gap-3 mb-4">
              <button 
                className="btn btn-success btn-lg ms-2" 
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
              <button 
                className="btn btn-danger px-4" 
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <input
                type="text"
                className="form-control w-50"
                placeholder="Enter PIN code"
              />
              <button className="btn btn-dark">Check</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
