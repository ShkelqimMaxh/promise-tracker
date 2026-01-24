import { Pool } from 'pg';

// Database configuration
// Support both DATABASE_URL (Railway/Heroku style) and individual variables
let poolConfig;
if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (Railway/Heroku style)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Fall back to individual variables (local development)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'promise_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

export const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing table: Make password_hash nullable (for OAuth users)
    try {
      const checkResult = await pool.query(`
        SELECT column_name, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
      `);
      
      if (checkResult.rows.length > 0 && checkResult.rows[0].is_nullable === 'NO') {
        await pool.query(`
          ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL
        `);
        console.log('✓ Made password_hash nullable');
      }
    } catch (error: any) {
      console.log('Note: Could not alter password_hash column:', error.message);
    }

    // Migrate existing table: Add google_id column if it doesn't exist
    try {
      const checkResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'google_id'
      `);
      
      if (checkResult.rows.length === 0) {
        // Column doesn't exist, add it
        await pool.query(`
          ALTER TABLE users ADD COLUMN google_id VARCHAR(255)
        `);
        console.log('✓ Added google_id column');
        
        // Add unique constraint
        await pool.query(`
          ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id)
        `);
        console.log('✓ Added unique constraint on google_id');
        
        // Create index
        await pool.query(`
          CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL
        `);
        console.log('✓ Created index on google_id');
      } else {
        // Column exists, just ensure index exists
        try {
          await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL
          `);
        } catch (error: any) {
          // Index might already exist, which is fine
        }
      }
    } catch (error: any) {
      console.log('Note: Could not add google_id column:', error.message);
    }

    // Create refresh_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create promises table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        promisee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        promisee_email VARCHAR(255),
        mentor_email VARCHAR(255),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        deadline TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'overdue', 'declined', 'not_made')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create milestones table (checkmarks)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        promise_id UUID NOT NULL REFERENCES promises(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create promise_notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promise_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        promise_id UUID NOT NULL REFERENCES promises(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN (
          'promise_invitation',
          'mentorship_invitation',
          'milestone_completed',
          'note_added',
          'promise_completed',
          'promise_overdue',
          'deadline_near'
        )),
        related_promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promises_user_id ON promises(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promises_promisee_id ON promises(promisee_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promises_mentor_id ON promises(mentor_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status)
    `);

    // Migration: add 'not_made' to promise status (for existing DBs)
    try {
      // Find and drop the status check constraint (name can vary: promises_status_check, etc.)
      const cons = await pool.query(`
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'promises' AND c.contype = 'c'
      `);
      for (const row of cons.rows) {
        await pool.query({ text: `ALTER TABLE promises DROP CONSTRAINT IF EXISTS "` + String(row.conname).replace(/"/g, '""') + `"` });
      }
      // Drop by common name (idempotent) and add new constraint
      await pool.query(`ALTER TABLE promises DROP CONSTRAINT IF EXISTS promises_status_check`);
      await pool.query(`
        ALTER TABLE promises ADD CONSTRAINT promises_status_check
        CHECK (status IN ('ongoing', 'completed', 'overdue', 'declined', 'not_made'))
      `);
      console.log('✓ Added not_made to promise status');
    } catch (error: any) {
      console.log('Note: Could not migrate promise status (may already include not_made):', error.message);
    }

    // Migration: add email fields to promises table (for existing DBs)
    try {
      const checkPromiseeEmail = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'promises' AND column_name = 'promisee_email'
      `);
      
      if (checkPromiseeEmail.rows.length === 0) {
        await pool.query(`
          ALTER TABLE promises ADD COLUMN promisee_email VARCHAR(255)
        `);
        console.log('✓ Added promisee_email column');
      }

      const checkMentorEmail = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'promises' AND column_name = 'mentor_email'
      `);
      
      if (checkMentorEmail.rows.length === 0) {
        await pool.query(`
          ALTER TABLE promises ADD COLUMN mentor_email VARCHAR(255)
        `);
        console.log('✓ Added mentor_email column');
      }

      // Create indexes for email lookups
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_promises_promisee_email ON promises(promisee_email) WHERE promisee_email IS NOT NULL
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_promises_mentor_email ON promises(mentor_email) WHERE mentor_email IS NOT NULL
      `);
    } catch (error: any) {
      console.log('Note: Could not add email columns to promises:', error.message);
    }

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_milestones_promise_id ON milestones(promise_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promise_notes_promise_id ON promise_notes(promise_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_promise_notes_user_id ON promise_notes(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_related_promise_id ON notifications(related_promise_id)
    `);

    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_promises_updated_at ON promises;
      CREATE TRIGGER update_promises_updated_at
        BEFORE UPDATE ON promises
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
      CREATE TRIGGER update_milestones_updated_at
        BEFORE UPDATE ON milestones
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
