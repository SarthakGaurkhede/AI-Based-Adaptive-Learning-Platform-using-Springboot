# Knowledge Guru — Spring Boot Backend Conversion

This is a conversion of the original Node/Express/MongoDB backend to **Java 21 + Spring
Boot 3.3** while keeping **MongoDB** as the database (Spring Data MongoDB), as requested.
The React frontend (`frontend/`) is unchanged except for one file: real-time battle
events now use **WebSocket/STOMP** instead of Socket.IO, to match the new backend.

## What's included

- **All 13 modules** ported: auth, users, courses (+ modules/topics/resources),
  enrollments, quizzes, knowledge-gaps, gamification (XP/levels/streaks/leaderboard/
  achievements/battles), AI tutor (Gemini), notifications, recommendations, study
  plans, flashcards, search, analytics, admin.
- **JWT auth** (access + rotating refresh tokens, HttpOnly cookie), Spring Security,
  BCrypt password hashing — behavior matches the Node `auth.service.js` (device-scoped
  refresh tokens, reuse detection, email verification, password reset).
- **MongoDB** via Spring Data MongoDB, same collections/field shapes as the Node models
  (`src/main/java/.../model/*.java` mirrors `backend/src/models/index.js` and friends).
- **Real-time**: STOMP over SockJS at `/ws`, replacing Socket.IO. Notifications push to
  `/user/queue/notifications`, leaderboard to `/topic/leaderboard`, and battles to
  `/topic/battle/{battleId}` (see `websocket/`).
- **Gemini AI integration** via a `WebClient`-based `GeminiClient`, used by
  `AiTutorService` for the tutor chat, study-plan narratives, quiz/course/flashcard
  generation — same prompts and JSON-schema contracts as the Node version.
- **Scheduled jobs** (`@Scheduled`) replace the Node BullMQ leaderboard-snapshot job.

## Project layout

```
springboot-backend/
  pom.xml
  src/main/resources/application.yml   # all env vars, see below
  src/main/java/com/knowledgeguru/backend/
    config/        # security, CORS, WebClient, typed @ConfigurationProperties
    security/      # JWT service, auth filter, principal
    model/         # MongoDB documents (one class per collection)
    repository/    # Spring Data MongoDB repositories
    auth/ users/ courses/ quizzes/ knowledgegaps/ gamification/
    ai/ notifications/ recommendations/ studyplans/ flashcards/
    search/ analytics/ admin/ websocket/
frontend/           # unchanged React app, minus the Socket.IO → STOMP swap
```

## Running it

1. **MongoDB**: point `MONGODB_URI` at your instance (defaults to
   `mongodb://localhost:27017/knowledge-guru` — same DB the Node backend used, so your
   existing data works as-is).
2. **Environment variables** (see `application.yml` for the full list / defaults):
   `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`,
   `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`, `EMAIL_FROM`.
3. **Build & run**:
   ```bash
   cd springboot-backend
   mvn spring-boot:run
   # or: mvn clean package && java -jar target/knowledge-guru-backend.jar
   ```
   The API serves on `http://localhost:5000/api/v1/...` — same base path/port as the
   Node backend, so the frontend needs no config changes beyond `REACT_APP_API_URL`.
4. **Frontend**: `cd frontend && npm install && npm start` (this now installs
   `@stomp/stompjs` + `sockjs-client` instead of `socket.io-client`).

## Notes / things worth reviewing before production

- **This code has not been compiled in this environment** (no Maven-Central network
  access here) — please run `mvn clean compile` locally as a first step. I did a
  careful manual pass for type/signature mismatches, but a real compiler pass may
  surface small issues (an unresolved import, a Lombok getter/setter name, etc.).
- **AI chat session storage** (`AiTutorService`) is an in-memory `Map`, matching the
  Node version's in-memory session store. It won't survive a restart or work across
  multiple instances — swap in a Mongo-backed session collection if you need either.
- **RAG / vector search** for course-resource context (mentioned in the Node
  `rag.service.js`) was not ported — the tutor works, but without vector-retrieved
  context from uploaded course materials. Wiring in a vector store (e.g. Atlas Vector
  Search, since you're already on MongoDB) would be the natural next step.
- **AI usage cost tracking**: `AiUsage.costUsd`/token counts are left at 0 since the
  Gemini REST response's usage metadata wasn't parsed — worth wiring up if the admin
  cost dashboard matters to you.
- Role/permission checks are done inline per-controller (matching the Node
  `authorize(...)` middleware style) rather than method-security annotations, to keep
  the port as close to a 1:1 mirror of the original logic as possible.
