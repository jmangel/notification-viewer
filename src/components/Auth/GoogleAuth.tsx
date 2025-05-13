import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';

interface GoogleAuthProps {
  onAuthSuccess: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthSuccess }) => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: any) => {
    await login(credentialResponse);
    onAuthSuccess();
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow">
            <Card.Body className="text-center">
              <h2 className="mb-4">Sign in to Access Notifications</h2>
              <p className="mb-4">
                Please sign in with your Google account to access your
                notification files.
              </p>
              <div className="d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.log('Login Failed')}
                  scope="https://www.googleapis.com/auth/drive.readonly"
                  useOneTap
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GoogleAuth;
