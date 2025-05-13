const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const FOLDER_NAME = 'NotificationReboot';

export const findNotificationFolder = async (
  token: string
): Promise<string | null> => {
  const response = await fetch(
    `${DRIVE_API_URL}/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  return null;
};

export const listDatabaseFiles = async (
  token: string,
  folderId: string
): Promise<any[]> => {
  const response = await fetch(
    `${DRIVE_API_URL}/files?q='${folderId}' in parents and name contains '.db' and trashed=false&fields=files(id,name,size,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (data.files) {
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      size: parseInt(file.size, 10),
      modifiedTime: new Date(file.modifiedTime),
    }));
  }

  return [];
};

export const downloadFile = async (
  token: string,
  fileId: string
): Promise<ArrayBuffer> => {
  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.arrayBuffer();
};
