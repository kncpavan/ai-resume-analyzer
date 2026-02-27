# Backend

This is the backend for the AI Resume Analyzer.

It is a Node.js Express server with MongoDB support.

## Installation

```bash
cd backend
npm install
```

## Running

```bash
npm start
```

For development:

```bash
npm run dev
```

## API

Currently provides basic API endpoints.

The frontend uses Puter.js for backend services, so this backend can be used for additional API endpoints if needed.

## Environment

Create a `.env` file in the backend folder with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer
```

## Deployment

Deploy this folder to your server.

Make sure MongoDB is running.

For production, use a process manager like PM2.
