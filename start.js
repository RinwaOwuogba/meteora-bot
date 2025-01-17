const { execSync } = require('child_process');
const path = require('path');

// Get the app name from environment variables
const appName = process.env.APP_NAME;

if (!appName) {
  console.error('Error: APP_NAME environment variable not set.');
  process.exit(1);
}

console.log(`Starting app: ${appName}`);

// Navigate to the app directory
const appPath = path.join(__dirname, 'apps', appName);
process.chdir(appPath);

// Start the app (uses the app's package.json start script or Procfile equivalent)
console.log(`Starting ${appName}...`);
execSync('npm start', { stdio: 'inherit' });
