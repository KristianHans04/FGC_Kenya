#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting FIRST Global Team Kenya Development Environment')
console.log('='.repeat(60))
console.log()

// Check if .env.local exists
const envPath = path.resolve(__dirname, '../.env.local')
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env.local file not found!')
  console.log('   Please copy .env.example to .env.local and configure your environment variables.')
  console.log('   Run: cp .env.example .env.local')
  console.log()
}

// Check for critical environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET']
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const missingVars = requiredVars.filter(v => !envContent.includes(`${v}=`))

if (missingVars.length > 0) {
  console.log('⚠️  Warning: Missing required environment variables:')
  missingVars.forEach(v => console.log(`   • ${v}`))
  console.log('   Please check your .env.local file.')
  console.log()
}

console.log('📦 Services starting:')
console.log('  • Next.js Development Server (http://localhost:3000)')
console.log('  • Maildev Email Testing (http://localhost:1080)')
console.log()

console.log('🌐 Access URLs:')
console.log('  • Application: http://localhost:3000')
console.log('  • Email Testing: http://localhost:1080')
console.log()

console.log('📧 Email Testing:')
console.log('  • All emails sent by the app will appear in Maildev')
console.log('  • SMTP Server: localhost:1025 (automatically configured)')
console.log()

console.log('🔐 Default Admin Account:')
console.log('  • Email: admin@example.com')
console.log('  • OTP will be sent to this email (check Maildev)')
console.log()

console.log('🛠️  Available Commands:')
console.log('  • npm run dev:next - Start only Next.js')
console.log('  • npm test - Run tests')
console.log('  • npm run db:seed - Reset and seed database')
console.log()

console.log('⏳ Starting services...')
console.log('Press Ctrl+C to stop all services')
console.log()

// Run concurrently with Next.js and Maildev
const concurrently = spawn('npx', [
  'concurrently',
  '"next dev"',
  '"npm run maildev:dev"',
  '--names',
  'next,maildev',
  '--prefix',
  'name',
  '--restart-tries',
  '3'
], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development servers...')
  concurrently.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development servers...')
  concurrently.kill('SIGTERM')
  process.exit(0)
})

// Handle concurrent process errors
concurrently.on('error', (error) => {
  console.error('Failed to start development servers:', error.message)
  process.exit(1)
})
