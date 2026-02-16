# Ziptech Labs

Ziptech Labs is an execution-first incubation platform for early-stage founders. The core value is accountability, peer visibility, and structured progress.

## Tech Stack

- **Web:** MERN stack (MongoDB, Express.js, React.js, Node.js)
- **Mobile:** React Native (shared logic where possible)
- **Backend:** Node.js + Express
- **Database:** MongoDB (with Mongoose)
- **Auth:** JWT-based authentication

## Project Structure

- `/server`: Node.js Express Backend
- `/client`: React Web Frontend
- `/mobile`: React Native Mobile App

## getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup

1.  **Backend:**
    ```bash
    cd server
    npm install
    cp .env.example .env
    npm run dev
    ```

2.  **Frontend (Web):**
    ```bash
    cd client
    npm install
    npm run dev
    ```

3.  **Mobile:**
    ```bash
    cd mobile
    npm install
    npx expo start
    ```
