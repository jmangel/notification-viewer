import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Notification } from '../../types';
import { Container, Alert, Spinner, Modal, Button } from 'react-bootstrap';
import FilterBox from './FilterBox';
import NotificationItem from './NotificationItem';

const NotificationList: React.FC = () => {
  const { notifications, currentDatabase, refreshNotifications } =
    useDatabase();
  const [filter, setFilter] = useState<string>('');
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    body: string;
    action?: string;
    notification?: Notification;
  }>({ title: '', body: '' });

  useEffect(() => {
    if (!filter) {
      setFilteredNotifications(notifications);
      return;
    }

    const filterWords = filter.toLowerCase().split(' ');
    const filtered = notifications.filter((notification) =>
      filterWords.every(
        (word) =>
          notification.app.toLowerCase().includes(word) ||
          notification.title.toLowerCase().includes(word) ||
          notification.text.toLowerCase().includes(word) ||
          notification.datetime.toString().toLowerCase().includes(word)
      )
    );
    setFilteredNotifications(filtered);
  }, [filter, notifications]);

  useEffect(() => {
    if (notifications.length === 0 && currentDatabase) {
      setIsLoading(true);
      refreshNotifications()
        .then(() => setIsLoading(false))
        .catch((err) => {
          setError('Failed to load notifications. Please try again.');
          setIsLoading(false);
        });
    }
  }, [currentDatabase, notifications.length, refreshNotifications]);

  const handleNotificationAction = (
    action: string,
    notification: Notification
  ) => {
    console.log(`Action "${action}" on notification:`, notification);

    switch (action) {
      case 'open':
        setModalContent({
          title: 'Open Notification',
          body: `This would open the notification from ${notification.app} with title "${notification.title}"`,
          action,
          notification,
        });
        setShowModal(true);
        break;

      case 'search':
        const searchTerm = notification.title || notification.text;
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`,
          '_blank'
        );
        break;

      case 'archive':
        setModalContent({
          title: 'Archive Notification',
          body: `This would archive the notification from ${notification.app} with title "${notification.title}"`,
          action,
          notification,
        });
        setShowModal(true);
        break;

      case 'delete':
        setModalContent({
          title: 'Delete Notification',
          body: `Are you sure you want to delete this notification from ${notification.app}?`,
          action,
          notification,
        });
        setShowModal(true);
        break;

      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleConfirmAction = () => {
    if (!modalContent.action || !modalContent.notification) {
      setShowModal(false);
      return;
    }

    console.log(
      `Confirmed action: ${modalContent.action}`,
      modalContent.notification
    );

    if (modalContent.action === 'delete') {
      const newFilteredNotifications = filteredNotifications.filter(
        (n) => n.id !== modalContent.notification!.id
      );
      setFilteredNotifications(newFilteredNotifications);
    }

    setShowModal(false);
  };

  return (
    <Container>
      <h2 className="mb-3">Saved Notifications</h2>
      {currentDatabase && (
        <Alert variant="info">
          Viewing database: <strong>{currentDatabase.name}</strong>
        </Alert>
      )}

      <FilterBox filter={filter} setFilter={setFilter} />

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading notifications...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredNotifications.length === 0 ? (
        <Alert variant="warning">
          No notifications found matching your filter.
        </Alert>
      ) : (
        filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onAction={handleNotificationAction}
          />
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          {modalContent.action === 'delete' && (
            <Button variant="danger" onClick={handleConfirmAction}>
              Delete
            </Button>
          )}
          {(modalContent.action === 'open' ||
            modalContent.action === 'archive') && (
            <Button variant="primary" onClick={handleConfirmAction}>
              Confirm
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NotificationList;
