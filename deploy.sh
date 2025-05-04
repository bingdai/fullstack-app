#!/bin/bash

# Install dependencies
npm ci

# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
