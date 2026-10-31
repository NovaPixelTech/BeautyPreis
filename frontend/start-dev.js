const { spawn } = require('child_process');
const vite = spawn('node', ['.\\node_modules\\.bin\\vite', 'dev', '--host'], {
  cwd: 'C:\\Users\\giong\\Antigravity Projects\\BeautyPreis\\frontend',
  stdio: 'inherit',
  env: { ...process.env, PORT: '3011' }
});

vite.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});