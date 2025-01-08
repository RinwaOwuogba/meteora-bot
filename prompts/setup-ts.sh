#!/bin/bash

# Ensure the script exits on error
set -e

# Check for project name argument
if [ -z "$1" ]; then
  echo "Usage: $0 <project-name>"
  exit 1
fi

PROJECT_NAME=$1

# Create project directory
echo "Creating project: $PROJECT_NAME"
# mkdir "$PROJECT_NAME"
# cd "$PROJECT_NAME"

# Initialize Yarn project
echo "Initializing Yarn project..."
# yarn init -y

# Add TypeScript and essential dependencies
echo "Installing TypeScript and essential dependencies..."
yarn add -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint prettier eslint-config-prettier eslint-plugin-prettier

# Initialize TypeScript
echo "Setting up TypeScript..."
yarn tsc --init

# Update tsconfig.json with common defaults
echo "Configuring tsconfig.json..."
cat <<EOL > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
EOL

# Create source directory
echo "Creating src directory..."
mkdir src
echo "// Entry point" > src/index.ts

# Configure ESLint
echo "Configuring ESLint..."
cat <<EOL > .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": ["error"],
  },
};
EOL

# Configure Prettier
echo "Configuring Prettier..."
cat <<EOL > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
EOL

# Create a .gitignore file
echo "Creating .gitignore..."
cat <<EOL > .gitignore
node_modules
dist
.env
EOL

# Final message
echo "Project setup complete!"
echo "Run 'yarn build' to compile your TypeScript code or 'yarn lint' to lint your files."
