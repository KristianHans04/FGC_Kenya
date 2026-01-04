#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

let nextProcess = null;
let maildevProcess = null;
let maildevReady = false;
let nextReady = false;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function killProcessOnPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
  } catch (e) {
    // Port not in use, continue
  }
}

function killProcessByName(name) {
  try {
    execSync(`pkill -9 -f "${name}" 2>/dev/null`, { stdio: 'ignore' });
  } catch (e) {
    // Process not running, continue
  }
}

function cleanupStaleFiles() {
  const nextDir = path.join(process.cwd(), '.next');
  const lockFile = path.join(nextDir, 'dev', 'lock');
  
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }
  } catch (e) {
    // Lock file doesn't exist or can't be removed
  }
}

function initialCleanup() {
  console.log('🧹 Cleaning up existing processes and stale files...\n');
  
  killProcessByName('next dev');
  killProcessByName('next-server');
  killProcessByName('maildev');
  
  killProcessOnPort(3000);
  killProcessOnPort(1080);
  killProcessOnPort(1025);
  
  cleanupStaleFiles();
  
  // Wait a bit for processes to fully terminate
  execSync('sleep 1', { stdio: 'ignore' });
}

function cleanup() {
  console.log('\n\n🛑 Shutting down services...\n');
  
  if (maildevProcess) {
    maildevProcess.kill('SIGTERM');
  }
  
  if (nextProcess) {
    nextProcess.kill('SIGTERM');
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

initialCleanup();

console.log('🚀 Starting development servers...\n');

maildevProcess = spawn('npx', ['maildev', '--web', '1080', '--smtp', '1025'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

maildevProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (!maildevReady && output.includes('MailDev webapp running')) {
    maildevReady = true;
    console.log('📧 MailDev');
    console.log(`   - Web UI:        http://localhost:1080`);
    console.log(`   - SMTP Server:   localhost:1025\n`);
  }
});

maildevProcess.stderr.on('data', (data) => {
  // Suppress maildev stderr unless there's an actual error
  const output = data.toString();
  if (output.includes('error') || output.includes('Error')) {
    console.error('MailDev Error:', output);
  }
});

maildevProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`MailDev exited with code ${code}`);
  }
});

setTimeout(() => {
  nextProcess = spawn('npm', ['run', 'dev:next'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    
    if (!nextReady && output.includes('Ready')) {
      nextReady = true;
    }
    
    // Pass through Next.js output as-is, it already formats nicely
    process.stdout.write(data);
  });

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  nextProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Next.js exited with code ${code}`);
    }
    cleanup();
  });
}, 500);

process.stdin.resume();
