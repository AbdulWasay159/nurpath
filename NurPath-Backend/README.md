# NurPath Backend

## Install
```bash
npm install
```

## Setup
Rename `.env.example` to `.env`

Add your MongoDB URI and JWT secret.

Example:
```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=supersecretkey
FRONTEND_URL=http://localhost:3000
```

## Run Development Server
```bash
npm run dev
```

## Seed Admin + Events
```bash
npm run seed
```

Admin Login:
Email: admin@nurpath.app
Password: Admin@123
