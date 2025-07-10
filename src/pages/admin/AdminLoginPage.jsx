import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminLoginMutation } from '../../store/api/authApi';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const { error, isAuthenticated, userType } = useSelector((state) => state.auth);
  
  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && userType === 'admin') {
      const from = location.state?.from?.pathname || '/admin/board';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location]);
  
  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }
    
    dispatch(loginStart());
    
    try {
      const result = await adminLogin({
        email: formData.email,
        password: formData.password,
        deviceInfo: navigator.userAgent
      }).unwrap();
      
      dispatch(loginSuccess({
        user: result.data.admin,
        token: result.data.tokens.accessToken,
        refreshToken: result.data.tokens.refreshToken,
        userType: 'admin',
        permissions: result.data.admin.permissions || []
      }));
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/admin/table';
      navigate(from, { replace: true });
      
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Login failed. Please try again.';
      dispatch(loginFailure(errorMessage));
    }
  };
  
  const handleForgotPassword = () => {
    navigate('/admin/forgot-password');
  };
  
  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-title">Admin Login</h1>
            <p className="admin-login-subtitle">
              Access the Taotter admin panel
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-login-error">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your admin email"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="form-group form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="admin-login-btn"
            >
              {isLoading ? (
                <span className="loading-content">
                  <span className="loading-spinner"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="admin-login-footer">
            <p className="login-help-text">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
