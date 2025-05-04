# Full Stack Web Application

A simple full stack application built with Node.js, Express, HTML, CSS, and JavaScript.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Run the development server with hot reloading:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production

To run in production mode:
```bash
npm start
```

## Deployment

This application can be deployed to various platforms. Here are some options:

### Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Login to Heroku:
   ```bash
   heroku login
   ```
4. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### Vercel
1. Create a Vercel account
2. Install Vercel CLI
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy:
   ```bash
   vercel
   ```

## Project Structure

```
fullstack-app/
├── public/           # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js         # Express server
└── package.json      # Project dependencies
```

## Features

- Modern responsive design
- RESTful API endpoint
- Client-server communication
- Development environment with hot reloading
