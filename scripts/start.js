import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🚀 Starting HESTIA: Frontend (Vite) + Backend API (Express)...\n');

const api = spawn(npmCmd, ['run', 'api'], { stdio: 'inherit', shell: true });
const dev = spawn(npmCmd, ['run', 'dev'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  api.kill();
  dev.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
