import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginSignup/LoginPage';
import SignUp from './LoginSignup/SignUp';
import TopNavbar from './NavBar/TopNavbar';
import MainNavNavbar from './NavBar/MainNavbar';
import Home from './HomePage/Home';
import useScrollNavbar from './hooks/useScrollNavbar';
import AddProductForm from './Admin/AddProduct/AddProductForm';
import AdminHome from './Admin/AdminHome/AdminHome';
import ShowAllProducts from './Admin/ShowAllProducts/ShowAllProducts';
import ShowAllCustomers from './Admin/ShowAllCustomers/ShowAllCustomer';
import AllProducts from './User/AllProducts/AllProducts.jsx';
import CatsAndSubCats from './User/catsubcat/CatsAndSubCats.jsx';
import ProductDetailPage from './User/catsubcat/ProductDetailPage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CartProvider } from './components/CartContext.js';
import CartPage from './components/CartPage.jsx';
import CheckoutPage from './components/CheckoutPage.jsx';
import OrdersPage from './components/OrdersPage.jsx';
import ContactUs from './ContactUs/ContactUs.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CategoryNavbar from './NavBar/CategoryNavbar.jsx';
import { ToastProvider } from './components/ToastManager.jsx';
import ForgotPassword from './LoginSignup/ForgotPassword.jsx';

function App() {
  const { mainNavRef, isMainNavVisible } = useScrollNavbar();

  return (
    <div className="App">
      <CartProvider>
        <BrowserRouter>
          <ToastProvider>
          {!isMainNavVisible && (
            <>
              <TopNavbar />
             <CategoryNavbar />
            </>
          )}

          <div
            ref={mainNavRef}
            style={{
              transform: "translateY(-400%)",
              opacity: 0,
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 999,
              backgroundColor: "white",
            }}
          >
            <MainNavNavbar />
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/home" element={<Home />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/allProducts" element={<AllProducts />} />
            <Route path="/cat/:cat/:subcategory" element={<CatsAndSubCats />} />

            {/* Cart and Checkout Routes */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/adminHome"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AddProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ShowAllProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ShowAllCustomers />
                </ProtectedRoute>
              }
            />
            <Route path="/products/:modelNo" element={<ProductDetailPage />} />
            <Route path="/contactUs" element={<ContactUs />} />

          </Routes>
          </ToastProvider>
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;

