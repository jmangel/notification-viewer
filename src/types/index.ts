export interface Notification {
  id: string;
  app: string;
  title: string;
  text: string;
  datetime: Date;
}

export interface DatabaseFile {
  id: string;
  name: string;
  size: number;
  modifiedTime: Date;
}

export interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (credentialResponse: any) => Promise<void>;
  logout: () => void;
}

export interface DatabaseContextType {
  notifications: Notification[];
  currentDatabase: DatabaseFile | null;
  loadDatabase: (file: DatabaseFile, db: any) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}
