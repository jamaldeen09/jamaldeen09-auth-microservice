# 🚀 Auth Microservice (TypeScript + Node + Express + MongoDB)

## 🔒 Overview
This service handles **user authentication and authorization** with **JWT-based access & refresh tokens**, **HTTP-only cookies**, and a **caching layer** for performance.

It’s designed as a **standalone microservice** — plug it into any frontend (Next.js, React, etc.) or API gateway.  
Built with **production-grade patterns**: token rotation, short-lived access tokens, robust error handling, and full TypeScript safety.

---

## 🧩 Tech Stack
- **Node.js + Express** — API layer  
- **TypeScript** — static typing and maintainability  
- **MongoDB + Mongoose** — persistent user storage  
- **JWT (jsonwebtoken)** — token generation and verification  
- **bcrypt** — password hashing  
- **dotenv** — environment config management  
- **Map / Redis-ready cache services** — high-speed user lookups  

---

## 📁 Project Structure
src/
├── config/
│ ├── database.config.ts # MongoDB init with retry logic
│ ├── env.config.ts # Environment variable management
│
├── controllers/
│ └── auth.controllers.ts # Core authentication logic
│
├── services/
│ ├── auth.services.ts # Token & cookie utilities
│ ├── cache.services.ts # In-memory (Map) or Redis caching
│
├── models/
│ └── User.ts # Mongoose schema + interface
│
├── types/
│ └── auth.types.ts # Shared TypeScript types/interfaces
│
├── routes/
│ └── auth.routes.ts # Express route definitions
│
└── server.ts # App entry point


---

## ⚙️ Environment Variables
Create a `.env` file in the root directory with:

```env
ACCESS_TOKEN_SECRET=yourAccessTokenSecret
REFRESH_TOKEN_SECRET=yourRefreshTokenSecret
MONGO_URI=yourMongoDbConnectionString
PORT=8080
NODE_ENV=development

---

### Core Features

 - JWT-based access + refresh tokens

 - Secure HTTP-only cookies

 - Password hashing with bcrypt

 - Request validation via express-validator

 - Caching layer (Map/Redis) for fast user session reads

 - Robust error handling and typed responses

 - Built using modular architecture — easy to extend

---

## Caching Layer

By default, this project uses a Map() for in-memory caching — simple and fast for local/temporary demos.
You can replace it with Redis when deploying to production for distributed caching across servers.

Used primarily for:

Caching authenticated users (to reduce DB reads)

Faster token refresh operations

---
## Deployment Notes

You can deploy this backend to:

 - Render — free for small Node.js servers

 - Railway — smooth GitHub-based deploys

 - Vercel (Edge Functions) — only if converted to serverless

 - Fly.io / DigitalOcean — for long-running production builds

For your frontend, use Vercel.

🔁 Always set CORS origin to your frontend domain (e.g. https://auth-demo.vercel.app)
and cookie.sameSite to "none" with secure: true if you’re serving over HTTPS.

---
sequenceDiagram
    participant Client
    participant Server
    participant Cache
    participant DB as MongoDB

    Client->>Server: POST /auth/login (email, password)
    Server->>DB: Validate credentials
    DB-->>Server: User found
    Server->>Client: Set Access + Refresh Token cookies

    Note over Client,Server: Access Token expires

    Client->>Server: POST /auth/refresh
    Server->>DB: Verify refresh token payload
    DB-->>Server: User valid
    Server->>Cache: Store user session
    Server->>Client: New Access Token issued

    Client->>Server: GET /auth
    Server->>Cache: Read user session
    Cache-->>Server: Return cached user
    Server->>Client: Auth state returned

---
## Running the project

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm run start

# Or run in development mode
npm run dev


---
Author
 - Jamaldeen
 - https://github.com/jamaldeen09 (Github)

Repo
 - https://github.com/jamaldeen09/auth-microservice (Github)