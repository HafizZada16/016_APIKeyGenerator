# API Key Management System

Sistem manajemen API key dengan Node.js + Express.js dan MySQL.

## Fitur

- ✅ CRUD Admin
- ✅ Create API Key (dengan first_name, last_name, email, start_date, last_date, status)
- ✅ List User
- ✅ List API Key
- ✅ Validasi API Key (valid/tidak valid)

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup database:
   - Buat database MySQL
   - Jalankan file `schema.sql` di MySQL
   - Atau copy-paste isi `schema.sql` ke MySQL client

3. Setup environment variables:
   - Buat file `.env` di root folder
   - Copy dari `.env.example` dan sesuaikan:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=project_api
   DB_PORT=3306
   PORT=3000
   ```

4. Jalankan aplikasi:
```bash
npm start
# atau untuk development dengan auto-reload:
npm run dev
```

## API Endpoints

### Admin
- `GET /api/admin` - List all admins
- `GET /api/admin/:id` - Get admin by ID
- `POST /api/admin` - Create admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

### User
- `GET /api/user` - List all users
- `GET /api/user/:id` - Get user by ID with API keys

### API Key
- `GET /api/apikey` - List all API keys
- `GET /api/apikey/:id` - Get API key by ID
- `POST /api/apikey` - Create API key
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "start_date": "2024-01-01",
    "last_date": "2024-12-31",
    "status": "active"
  }
  ```
- `PUT /api/apikey/:id/status` - Update API key status
- `DELETE /api/apikey/:id` - Delete API key

### Auth
- `POST /api/auth/admin/login` - Admin login
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/validate` - Validate API key (untuk Postman)
  ```json
  {
    "api_key": "ak_..."
  }
  ```
  atau via header:
  ```
  x-api-key: ak_...
  ```

## Struktur Database

### Tabel `admin`
- id (PK)
- email
- password

### Tabel `user`
- id (PK)
- first_name
- last_name
- email
- apikey

### Tabel `apikey`
- id (PK)
- user_id (FK ke user.id)
- key
- start_date
- last_date
- outofdate
- status (active/inactive/expired)

## Testing dengan Postman

1. **Create API Key:**
   - Method: POST
   - URL: `http://localhost:3000/api/apikey`
   - Body (JSON):
     ```json
     {
       "first_name": "John",
       "last_name": "Doe",
       "email": "john@example.com",
       "start_date": "2024-01-01",
       "last_date": "2024-12-31",
       "status": "active"
     }
     ```

2. **Validate API Key:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/validate`
   - Header: `x-api-key: ak_...`
   - Response akan mengembalikan `valid: true` atau `valid: false`

## License

ISC

