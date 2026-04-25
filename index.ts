import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'

const app = express()
const PORT = 3000

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true
}))

app.use(express.json())
app.use(clerkMiddleware())

// Basic homepage route
app.get('/', (req, res) => {
  const { userId } = getAuth(req)
  
  if (userId) {
    res.json({ 
      message: 'Welcome! You are signed in.',
      userId: userId,
      links: {
        protected: '/protected'
      }
    })
  } else {
    res.json({ 
      message: 'Welcome to Clerk + Express!',
      status: 'Not authenticated',
      links: {
        protected: '/protected'
      }
    })
  }
})

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Use the `getUser()` method to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

// Update user profile endpoint
app.put('/api/user/update', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { firstName, lastName } = req.body;

    // Here you can:
    // 1. Save additional data to your own database
    // 2. Perform business logic
    // 3. Log the update
    
    console.log(`User ${userId} updated profile:`, { firstName, lastName });

    // Example: Save to your database
    // await db.users.update({ userId }, { firstName, lastName });

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      userId 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})