import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import GoogleAuth from './components/Auth/GoogleAuth';
import DriveFileBrowser from './components/DriveAccess/DriveFileBrowser';
import NotificationList from './components/Notifications/NotificationList';

// Get the Client ID from environment variables
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [databaseLoaded, setDatabaseLoaded] = useState<boolean>(false);

  // Check for stored auth on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!googleClientId) {
    console.error(
      'Google Client ID is missing. Please check your environment variables.'
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <DatabaseProvider>
          <Container className="mt-4">
            <h1 className="text-center mb-4">Notification Viewer</h1>

            {!isAuthenticated ? (
              <GoogleAuth onAuthSuccess={() => setIsAuthenticated(true)} />
            ) : !databaseLoaded ? (
              <DriveFileBrowser
                onDatabaseLoad={() => setDatabaseLoaded(true)}
              />
            ) : (
              <NotificationList />
            )}
          </Container>
        </DatabaseProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
