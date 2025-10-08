---
description: VoteFight Frontend Setup and Library Management Standards
globs: ["frontend/**/*.js", "frontend/**/*.ts", "frontend/**/*.tsx", "frontend/**/*.json"]
alwaysApply: true
---

# VoteFight Frontend Setup Standards

## Library Installation Policy
- **NEVER manually initialize libraries** - always use npm/yarn commands
- **ALWAYS use automated setup commands** for consistency
- **VERIFY installations** with package.json and lock files
- **USE version pinning** for production dependencies
- **FOLLOW engineering standards** for all new dependencies

## Automated Setup Commands

### 1. Next.js Project Creation
```bash
# Create Next.js project with all options
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 2. Core Dependencies Installation
```bash
# UI and interaction libraries
npm install @headlessui/react @heroicons/react framer-motion

# Form and validation
npm install react-hook-form @hookform/resolvers zod

# State management and API
npm install zustand axios

# Utilities
npm install date-fns
```

### 3. Media Player Libraries
```bash
# Rich media components
npm install wavesurfer.js video.js pdfjs-dist viewerjs

# TypeScript types
npm install -D @types/wavesurfer.js
```

### 4. Development Dependencies
```bash
# TypeScript and development tools
npm install -D @types/node @types/react @types/react-dom
```

## Verification Commands

### Check Installation
```bash
# Verify all packages installed
npm list --depth=0

# Check for vulnerabilities
npm audit

# Fix vulnerabilities (if safe)
npm audit fix
```

### Project Structure Verification
```bash
# Check Next.js structure
ls -la frontend/

# Verify TypeScript config
cat frontend/tsconfig.json

# Check Tailwind config
cat frontend/tailwind.config.ts
```

## Automated Setup Workflow

### 1. Project Initialization
```bash
# Remove existing directory if conflicts
rm -rf frontend

# Create fresh Next.js project
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 2. Dependency Installation
```bash
cd frontend

# Install core dependencies
npm install @headlessui/react @heroicons/react framer-motion react-hook-form @hookform/resolvers zod zustand axios date-fns

# Install media libraries
npm install wavesurfer.js video.js pdfjs-dist viewerjs

# Install TypeScript types
npm install -D @types/wavesurfer.js
```

### 3. Security and Quality
```bash
# Fix vulnerabilities
npm audit fix

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Prohibited Manual Actions

### ❌ NEVER Do These:
- Manually create package.json
- Manually install node_modules
- Manually configure TypeScript
- Manually set up Tailwind
- Manually create Next.js config
- Manually initialize dependencies

### ✅ ALWAYS Use Commands:
- Use `npx create-next-app` for project creation
- Use `npm install` for dependencies
- Use `npm run` for scripts
- Use automated configuration

## Safety Checks

### Pre-Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check available disk space
df -h
```

### Post-Installation
```bash
# Verify installation
npm list --depth=0

# Check for conflicts
npm ls

# Run security audit
npm audit
```

## Error Handling

### Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Version Conflicts
```bash
# Check for peer dependency warnings
npm install --legacy-peer-deps

# Or use exact versions
npm install package@exact-version
```

## Automated Verification

### Package.json Validation
```json
{
  "dependencies": {
    "@headlessui/react": "^2.0.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "zustand": "^4.0.0",
    "axios": "^1.0.0",
    "date-fns": "^2.0.0",
    "wavesurfer.js": "^7.0.0",
    "video.js": "^8.0.0",
    "pdfjs-dist": "^3.0.0",
    "viewerjs": "^1.0.0"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Development Workflow

### Daily Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Monitoring and Maintenance

### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Check security vulnerabilities
npm audit
```

### Performance Monitoring
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for unused dependencies
npx depcheck
```

## Integration with Backend

### API Configuration
```bash
# Install API client
npm install axios

# Configure environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

### Development Server
```bash
# Start both frontend and backend
npm run dev  # Frontend on :3000
# Backend on :8000 (separate terminal)
```

## Quality Assurance

### Automated Testing
```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Build Verification
```bash
# Build and verify
npm run build

# Check build output
ls -la .next/

# Verify static files
ls -la .next/static/
```

---

**Remember: Always use commands for setup, never manual configuration!**
