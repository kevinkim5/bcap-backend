# Brain Bot - Backend

## Overview

This project implements the server-side logic for Brain Bot, leveraging the power of Node.js and Express.js.

## Deployment

1. Create a Vercel account: https://vercel.com/
1. Connect your Vercel account to your GitHub repository.
1. Set up environment variables in Vercel
1. Vercel will automatically build and deploy your project when it detects changes pushed to your main branch.

## Development

1. Clone the repository
1. Install dependencies
   - Make sure to have Node.js installed
   - Run `npm install` to install dependencies
1. Set up environment variables
   - Make a copy of `.env.template` and name as `.env`
   - Input your environment variables
   - Ensure to never commit this file to the GitHub repo
1. Run the development server
   - `npm run start`
   - This will start the development server at `http://localhost:3030` by default.
   - If you need to use another port, set the port in `.env`

### App URL
https://bcap-backend.vercel.app
