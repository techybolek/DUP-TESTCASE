import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleSignIn = () => {
  const handleLoginSuccess = (response: any) => {
    console.log('Login Success:', response);
    // Handle login success (e.g., send the token to your server)
  };

  const handleLoginFailure = (error: any) => {
    console.error('Login Failed:', error);
    // Handle login failure
  };

  return (
    <GoogleOAuthProvider 
      clientId="YOUR_GOOGLE_CLIENT_ID"
      onSuccess={handleLoginSuccess}
      onError={handleLoginFailure}
    >
      <GoogleLogin />
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;