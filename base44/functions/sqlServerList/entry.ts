import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Connection, Request } from 'npm:tedious@18.3.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const server = Deno.env.get("CLOUD_SQL_SERVER");
    const database = Deno.env.get("CLOUD_SQL_DATABASE");
    const userName = Deno.env.get("CLOUD_SQL_USER");
    const password = Deno.env.get("CLOUD_SQL_PASSWORD");

    if (!server || !database || !userName || !password) {
      return Response.json({ error: 'Database connection secrets not configured' }, { status: 500 });
    }

    const { tableName } = await req.json();

    if (!tableName) {
      return Response.json({ error: 'tableName is required' }, { status: 400 });
    }

    return await new Promise((resolve) => {
      const config = {
        server,
        authentication: { type: 'default', options: { userName, password } },
        database,
        options: { encrypt: true, trustServerCertificate: true }
      };

      const connection = new Connection(config);
      const rows = [];

      connection.on('connect', (err) => {
        if (err) {
          resolve(Response.json({ error: err.message }, { status: 500 }));
        }
      });

      connection.on('error', (err) => {
        resolve(Response.json({ error: err.message }, { status: 500 }));
      });

      const request = new Request(`SELECT * FROM ${tableName}`, (err, rowCount) => {
        if (err) {
          resolve(Response.json({ error: err.message }, { status: 500 }));
        } else {
          resolve(Response.json({ rows, rowCount }));
        }
        connection.close();
      });

      request.on('row', (columns) => {
        const row = {};
        columns.forEach((column) => {
          row[column.metadata.colName] = column.value;
        });
        rows.push(row);
      });

      connection.execSql(request);
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});