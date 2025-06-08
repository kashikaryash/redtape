import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import baseUrl from '../baseUrl/baseUrl';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${baseUrl}/users/forgotPassword`, {
        email,
        mobile,
        newPassword
      });

      Swal.fire('Success', res.data, 'success').then(() => {
      navigate('/login'); // Redirect after successful reset
    });
    } catch (err) {
      const message = err.response?.data || "Something went wrong";
      Swal.fire('Error', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: '1000px' }}>

        {/* Left Side */}
        <div className="col-md-6 d-flex bg-white flex-column justify-content-center align-items-center text-white p-5 position-relative">
           <h2 className='text-danger mb-5' >Forgot Password</h2>
          <img src={'https://shopify-app-group-product.s3.amazonaws.com/1743072613564-RSO2192_1._11zon.jpg'} alt="RedTape Shoe" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
        </div>

        {/* Right Side */}
        <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <div className="text-center mb-4">
            <img src={'RedTapeLogo.png'} alt="RedTape Logo" style={{ maxWidth: '120px' }} />
          </div>

          
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email address</label>
            <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label>Mobile Number</label>
            <input type="text" className="form-control" required value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>

          <div className="mb-3">
            <label>New Password</label>
            <input type="password" className="form-control" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-danger w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Reset Password'}
          </button>
        </form>
         
        </div>
      </div>
    </div>
    

    </>
  );
}
