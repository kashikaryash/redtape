import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import baseUrl from '../baseUrl/baseUrl';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${baseUrl}/users/send-otp`, null, { params: { email } });
      Swal.fire('Success', 'OTP sent to your email', 'success');
      setStep(2);
    } catch (err) {
      Swal.fire('Error', err.response?.data || 'Failed to send OTP', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${baseUrl}/users/verify-otp`, null, { params: { email, otp } });
      Swal.fire('Success', 'OTP verified successfully', 'success');
      setStep(3);
    } catch (err) {
      Swal.fire('Error', err.response?.data || 'Invalid OTP', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${baseUrl}/users/reset-password`, {
        email,
        newPassword
      });
      Swal.fire('Success', 'Password reset successfully', 'success').then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data || 'Failed to reset password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) handleSendOtp();
    else if (step === 2) handleVerifyOtp();
    else if (step === 3) handleResetPassword();
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: '1000px' }}>
        <div className="col-md-6 d-flex bg-white flex-column justify-content-center align-items-center text-white p-5">
          <h2 className='text-danger mb-5'>Forgot Password</h2>
          <img src={'https://shopify-app-group-product.s3.amazonaws.com/1743072613564-RSO2192_1._11zon.jpg'} alt="RedTape Shoe" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
        </div>

        <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <div className="text-center mb-4">
            <img src={'RedTapeLogo.png'} alt="RedTape Logo" style={{ maxWidth: '120px' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Email address</label>
              <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} disabled={step > 1} />
            </div>

            {step === 2 && (
              <div className="mb-3">
                <label>OTP</label>
                <input type="text" className="form-control" required value={otp} onChange={e => setOtp(e.target.value)} />
              </div>
            )}

            {step === 3 && (
              <div className="mb-3">
                <label>New Password</label>
                <input type="password" className="form-control" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            )}

            <button type="submit" className="btn btn-danger w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' :
                step === 1 ? 'Send OTP' :
                step === 2 ? 'Verify OTP' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
