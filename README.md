# Ziptech Labs

Ziptech Labs is an execution-first incubation platform for early-stage founders. The core value is accountability, peer visibility, and structured progress.

Every founder builds a public **execution record** (`/f/:slug`) from weekly commitments, check-ins and peer signals. Investors can view it, rank founders by it (`/discover`), keep a watchlist, and export it as PDF (print) or CSV.

### Execution score

Computed in `server/src/services/executionScore.ts` (pure, unit-tested):

| Component | Weight | Measures |
|---|---|---|
| Delivery | 35% | Delivered ÷ resolved commitments (partial = ½) |
| Follow-through | 25% | Due commitments closed with a check-in |
| Consistency | 20% | Weeks with a commitment since the first one |
| Peer validation | 10% | Endorsements/supports from cohort peers on public goals |
| Community | 10% | Support given to others + meeting attendance |

Tiers are gated on delivery: *Exceptional* needs a score of 85+ **and** 85%+ delivery, and *Strong* needs 70+ **and** 65%+ delivery. Records with fewer than 4 resolved commitments are marked provisional. Goal outcomes can only be set through check-ins, and private goals count toward the score but are never shown publicly.

### Roles

`founder` and `investor` can self-register. `facilitator` and `admin` accounts are created with `npm run create-admin` or by updating the role in MongoDB.

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
    cp envexample.txt .env
    npm run dev
    ```

    Optional demo data (8 founders, 14 weeks of history, a facilitator and an investor; only touches `@demo.ziptechlabs.dev` accounts):
    ```bash
    npm run seed:demo   # password for all demo accounts: demo-password
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
