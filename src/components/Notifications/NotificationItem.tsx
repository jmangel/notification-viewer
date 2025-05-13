import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onAction: (action: string, notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onAction,
}) => {
  const { app, title, text, datetime } = notification;

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-us', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <Card className="notification-card mb-3">
      <Card.Body>
        <div className="d-flex align-items-center mb-2">
          <span className="notification-meta me-2">{formatDate(datetime)}</span>
          <span>-</span>
          <strong className="app-name ms-2">{app}</strong>
          {title && (
            <>
              <span className="ms-2">-</span>
              <span className="notification-title ms-2">{title}</span>
            </>
          )}
        </div>

        <div className="notification-text">{text}</div>

        <Row className="mt-3">
          <Col>
            <div className="d-flex gap-2 action-buttons">
              <Button
                variant="primary"
                onClick={() => onAction('open', notification)}
              >
                Open
              </Button>
              <Button
                variant="info"
                onClick={() => onAction('search', notification)}
              >
                Search
              </Button>
              <Button
                variant="warning"
                onClick={() => onAction('archive', notification)}
              >
                Archive
              </Button>
              <Button
                variant="danger"
                onClick={() => onAction('delete', notification)}
              >
                Delete
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default NotificationItem;
