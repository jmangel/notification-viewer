import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { DatabaseFile } from '../../types';
import { Card, ListGroup, Button, Spinner } from 'react-bootstrap';
import {
  findNotificationFolder,
  listDatabaseFiles,
  downloadFile,
} from '../../services/googleDriveApi';
import { openDatabase } from '../../services/sqliteService';

interface DriveFileBrowserProps {
  onDatabaseLoad: () => void;
}

const DriveFileBrowser: React.FC<DriveFileBrowserProps> = ({
  onDatabaseLoad,
}) => {
  const [files, setFiles] = useState<DatabaseFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();
  const { loadDatabase } = useDatabase();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // Find the NotificationReboot folder
        const folderId = await findNotificationFolder(token);
        if (!folderId) {
          setError('NotificationReboot folder not found in Google Drive');
          setLoading(false);
          return;
        }

        // List database files in the folder
        const dbFiles = await listDatabaseFiles(token, folderId);
        setFiles(dbFiles);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files from Google Drive. Please try again.');
        setLoading(false);
      }
    };

    fetchFiles();
  }, [token]);

  const handleFileSelect = async (file: DatabaseFile) => {
    try {
      setLoading(true);

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Download the file
      const fileBuffer = await downloadFile(token, file.id);

      // Open the database
      const db = await openDatabase(fileBuffer);

      // Load the database into context
      await loadDatabase(file, db);

      setLoading(false);
      onDatabaseLoad();
    } catch (err) {
      console.error('Error loading database:', err);
      setError('Failed to load database file. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading database files from Google Drive...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <Card className="shadow">
      <Card.Header as="h5">Select a Database File</Card.Header>
      <Card.Body>
        <Card.Text>
          Choose a notification database file from your NotificationReboot/
          folder on Google Drive:
        </Card.Text>

        <ListGroup>
          {files.length === 0 ? (
            <p>No database files found in NotificationReboot/ folder</p>
          ) : (
            files.map((file) => (
              <ListGroup.Item
                key={file.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{file.name}</strong>
                  <div className="text-muted small">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Last modified:{' '}
                    {file.modifiedTime.toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleFileSelect(file)}
                >
                  Select
                </Button>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default DriveFileBrowser;
