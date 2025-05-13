import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Notification, DatabaseFile, DatabaseContextType } from '../types';
import { getNotifications } from '../services/sqliteService';

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentDatabase, setCurrentDatabase] = useState<DatabaseFile | null>(
    null
  );
  const [dbInstance, setDbInstance] = useState<any>(null);

  const loadDatabase = async (file: DatabaseFile, db: any) => {
    try {
      setCurrentDatabase(file);
      setDbInstance(db);

      // Get notifications from the database
      const loadedNotifications = await getNotifications(db);

      if (loadedNotifications.length === 0) {
        console.warn('No notifications found in the database');
      }

      setNotifications(loadedNotifications);
    } catch (error) {
      console.error('Error loading database:', error);
      throw new Error('Failed to load notifications from database');
    }
  };

  const refreshNotifications = async () => {
    if (!dbInstance) {
      throw new Error('No database instance available');
    }

    try {
      const refreshedNotifications = await getNotifications(dbInstance);
      setNotifications(refreshedNotifications);
      return Promise.resolve();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      throw error;
    }
  };

  const getMockNotifications = (): Notification[] => {
    return Array(10)
      .fill(null)
      .map((_, index) => ({
        id: `id-${index}`,
        app: `App ${index}`,
        title: `Notification Title ${index}`,
        text: `This is notification text ${index}. It contains the content of the notification.`,
        datetime: new Date(Date.now() - index * 3600000),
      }));
  };

  const value = {
    notifications,
    currentDatabase,
    loadDatabase,
    refreshNotifications,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
