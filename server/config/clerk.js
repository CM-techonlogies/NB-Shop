const { clerkMiddleware, getAuth } = require('@clerk/express');

if (!process.env.CLERK_SECRET_KEY) {
  console.warn('⚠️  CLERK_SECRET_KEY not set. Auth will fail.');
}

module.exports = { clerkMiddleware, getAuth };
