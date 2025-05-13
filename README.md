# Google Drive Notification Viewer

A React application that lets users authenticate with their Google account, access SQLite database files from a specific folder on Google Drive, and view saved notifications.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with your Google Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```
4. To get a Google Client ID:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use an existing one)
   - Go to "APIs & Services" > "Credentials"
   - Configure the OAuth consent screen (External if not a Google Workspace account)
   - Create an OAuth Client ID (Web application)
   - Add `http://localhost:3000` to the Authorized JavaScript origins
   - Copy the Client ID

5. Start the development server:
   ```bash
   npm start
   ```

## Features

- Google OAuth authentication
- Access to SQLite database files in a Google Drive folder
- View and filter notifications from the database
- Actions for each notification: Open, Search, Archive, Delete

## Project Structure

- `/src/components` - React components
- `/src/contexts` - Context providers for authentication and database
- `/src/services` - Services for Google Drive API and SQLite
- `/src/types` - TypeScript interfaces

## Dependencies

- React
- TypeScript
- @react-oauth/google
- react-bootstrap
- sql.js
