# AI Grammar Genius

AI Grammar Genius is a full-stack web application that uses AI to correct grammar and spelling in user-submitted text. It features user authentication, password reset via OTP, and a history of corrections.

## Features

- AI-powered grammar and spelling correction (Google Gemini API)
- User authentication (signup, login, logout)
- Password reset via OTP (email)
- Correction history sidebar
- Responsive UI with animated backgrounds

## Project Structure

```
Client/
  ├── public/
  │   └── ai.png
  ├── src/
  │   ├── Components/
  │   │   ├── Home.jsx
  │   │   ├── Login.jsx
  │   │   ├── ForgotPassword.jsx
  │   │   └── HistoryView.jsx
  │   ├── Config/
  │   │   └── Config.js
  │   ├── App.jsx
  │   ├── App.css
  │   ├── index.css
  │   └── main.jsx
  ├── package.json
  ├── vite.config.js
  ├── eslint.config.js
  └── README.md
server/
  ├── app.js
  ├── .env
  ├── package.json
  ├── Config/
  │   └── Config.js
  ├── Controller/
  │   ├── User.js
  │   └── Airoute.js
  ├── Database/
  │   └── Dbconnect.js
  ├── Middleware/
  │   └── middleware.js
  ├── Models/
  │   ├── user.js
  │   ├── token.js
  │   └── aichat.js
  ├── Redis/
  │   └── redisconnect.js
  ├── Routes/
  │   ├── Userroute.js
  │   └── Airoute.js
views/
  └── index.js
.gitignore
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB instance
- Redis instance (Upstash or local)
- Gemini API key (for AI correction)

### Setup

#### 1. Clone the repository

```sh
git clone https://github.com/yourusername/aigrammar-genius.git
cd aigrammar-genius
```

#### 2. Install dependencies

**Client:**
```sh
cd Client
npm install
```

**Server:**
```sh
cd ../server
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```
MONGODB_URI=your_mongodb_connection_string
TOKEN_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
```

#### 4. Start the server

```sh
cd server
npm start
```

#### 5. Start the client

```sh
cd ../Client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- **Signup/Login:** Register or log in to access grammar correction features.
- **Correction:** Enter text on the home page and click "Enhance with AI" to get corrected output.
- **History:** View your correction history in the sidebar.
- **Forgot Password:** Use the "Forgot Password?" link on the login page to reset your password via OTP.

## API Endpoints

### User Routes

- `POST /api/user/signup` — Register a new user
- `POST /api/user/login` — Login
- `POST /api/user/logout` — Logout
- `POST /api/user/sendotp` — Send OTP for password reset
- `POST /api/user/verifyotp` — Verify OTP
- `POST /api/user/forgotpassword` — Reset password

### AI Routes

- `POST /api/ai/correct` — Correct grammar and spelling in submitted text
- `POST /api/ai/history` — Get user's correction history

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, React Hot Toast, React Icons
- **Backend:** Node.js, Express, MongoDB, Redis
- **AI:** Google Gemini API

## License

MIT

---

For more details, see the documentation and comments in each source file.