import initSqlJs, { Database } from 'sql.js';

let SQL: any;
let sqlPromise: Promise<any>;

const initSQL = async () => {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }

  SQL = await sqlPromise;
  return SQL;
};

export const openDatabase = async (buffer: ArrayBuffer): Promise<Database> => {
  await initSQL();
  return new SQL.Database(new Uint8Array(buffer));
};

// Inspect the database structure to help determine schema
export const inspectDatabaseTables = (db: Database): string[] => {
  try {
    const result = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => row[0] as string);
  } catch (error) {
    console.error('Error inspecting database tables:', error);
    return [];
  }
};

// Get table schema
export const getTableSchema = (db: Database, tableName: string): any => {
  try {
    return db.exec(`PRAGMA table_info(${tableName});`);
  } catch (error) {
    console.error(`Error getting schema for table ${tableName}:`, error);
    return null;
  }
};

export const getNotifications = async (db: Database): Promise<any[]> => {
  try {
    // First, determine what tables we have
    const tables = inspectDatabaseTables(db);

    // Check if we have a notifications table
    if (tables.includes('notifications')) {
      // Use a specific query for the notifications table
      const result = db.exec(`
        SELECT
          id,
          app,
          title,
          text,
          datetime
        FROM notifications
        ORDER BY datetime DESC
      `);

      if (result.length === 0 || result[0].values.length === 0) {
        return [];
      }

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row: any) => {
        const notification: any = {};
        columns.forEach((col: string, index: number) => {
          if (col === 'datetime') {
            notification[col] = new Date(row[index]);
          } else {
            notification[col] = row[index];
          }
        });
        return notification;
      });
    }

    // Try to find any table that might contain notifications
    for (const table of tables) {
      try {
        const schema = getTableSchema(db, table);
        if (!schema || schema.length === 0) continue;

        // Check if this table has columns we expect in notifications
        const columns = schema[0].values.map((col: any) =>
          col[1].toLowerCase()
        );

        const hasApp = columns.includes('app');
        const hasTitle =
          columns.includes('title') || columns.includes('subject');
        const hasText =
          columns.includes('text') ||
          columns.includes('body') ||
          columns.includes('content');

        if (hasApp && (hasTitle || hasText)) {
          console.log(`Found potential notification table: ${table}`);
          // Try to query it
          const columnsToSelect = [];
          let idCol = columns.includes('id')
            ? 'id'
            : columns.includes('_id')
            ? '_id'
            : null;
          let appCol = columns.includes('app') ? 'app' : null;
          let titleCol = columns.includes('title')
            ? 'title'
            : columns.includes('subject')
            ? 'subject'
            : null;
          let textCol = columns.includes('text')
            ? 'text'
            : columns.includes('body')
            ? 'body'
            : columns.includes('content')
            ? 'content'
            : null;
          let dateCol = columns.includes('datetime')
            ? 'datetime'
            : columns.includes('date')
            ? 'date'
            : columns.includes('timestamp')
            ? 'timestamp'
            : null;

          if (idCol) columnsToSelect.push(`${idCol} as id`);
          if (appCol) columnsToSelect.push(`${appCol} as app`);
          if (titleCol) columnsToSelect.push(`${titleCol} as title`);
          if (textCol) columnsToSelect.push(`${textCol} as text`);
          if (dateCol) columnsToSelect.push(`${dateCol} as datetime`);

          if (columnsToSelect.length >= 3) {
            // Need at least id, app, and one content field
            const query = `SELECT ${columnsToSelect.join(
              ', '
            )} FROM ${table} ORDER BY ${dateCol || 'rowid'} DESC`;
            const result = db.exec(query);

            if (result.length > 0 && result[0].values.length > 0) {
              const resultColumns = result[0].columns;
              const values = result[0].values;

              return values.map((row: any) => {
                const notification: any = {};
                resultColumns.forEach((col: string, index: number) => {
                  if (col === 'datetime') {
                    notification[col] = new Date(row[index]);
                  } else {
                    notification[col] = row[index];
                  }
                });
                return notification;
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error examining table ${table}:`, error);
        continue;
      }
    }

    console.error(
      'Could not find a suitable notifications table in the database'
    );
    return [];
  } catch (error) {
    console.error('Error querying database:', error);
    return [];
  }
};

export const countNotifications = (db: Database): number => {
  try {
    const tables = inspectDatabaseTables(db);
    if (tables.includes('notifications')) {
      const result = db.exec('SELECT COUNT(*) FROM notifications');
      return result[0].values[0][0] as number;
    }

    // If no notifications table, try to find another table with notification data
    for (const table of tables) {
      try {
        const result = db.exec(`SELECT COUNT(*) FROM ${table}`);
        return result[0].values[0][0] as number;
      } catch {
        continue;
      }
    }

    return 0;
  } catch (error) {
    console.error('Error counting notifications:', error);
    return 0;
  }
};
