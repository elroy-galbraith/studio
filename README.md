# Coach Loop Studio

A Next.js application for managing and analyzing coaching sessions, built with TypeScript and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd studio
```

2. Install dependencies:
```bash
# Make sure you're using the correct Node.js version
node -v  # Should show v18.x or later

# Install dependencies
npm install
# or
yarn install

# If you encounter any issues, try clearing npm cache
npm cache clean --force
```

3. Start the development server:
```bash
# The default port is 9002
npm run dev
# or
yarn dev
```

4. Open [http://localhost:9002](http:// localhost:9002) in your browser.

### Troubleshooting Installation

If you encounter "command not found" errors:

1. Make sure Next.js is installed locally:
```bash
npm install next@latest
```

2. Try using npx to run Next.js:
```bash
npx next dev --turbopack -p 9002
```

3. Check your package.json scripts:
```bash
cat package.json | grep scripts -A 10
```

## 🏗️ Project Structure

The project follows a modern Next.js 13+ structure with the App Router:

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared code
├── types/           # TypeScript type definitions
└── ai/              # AI-related functionality
```

For detailed information about the project structure, refer to our [Cursor Rules](.cursor/rules/).

## 🛠️ Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React Server Components (default)
- **Development**: ESLint, Prettier

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow functional component patterns
- Implement proper prop types
- Use Tailwind CSS for styling
- Keep components small and focused

### Best Practices
1. Use React Server Components by default
2. Add 'use client' directive only when needed
3. Implement proper loading states
4. Use custom hooks for complex logic
5. Follow the file-based routing convention

For more detailed guidelines, see our [development guide](.cursor/rules/development-guide.mdc).

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

Please follow our [development guidelines](.cursor/rules/development-guide.mdc) when contributing.

## 📚 Documentation

- [Project Structure](.cursor/rules/project-structure.mdc)
- [Components Guide](.cursor/rules/components-guide.mdc)
- [App Structure](.cursor/rules/app-structure.mdc)
- [Development Guide](.cursor/rules/development-guide.mdc)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002

# API Configuration
NEXT_PUBLIC_API_URL=your_api_url_here

# Authentication (if needed)
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database (if needed)
DATABASE_URL=your_database_url_here

# External Services (if needed)
OPENAI_API_KEY=your_openai_api_key_here
```

Make sure to:
1. Never commit `.env.local` to version control
2. Keep a `.env.example` file in the repository with dummy values
3. Document any new environment variables here

## 📦 Dependencies

Key dependencies:
- Next.js
- React
- TypeScript
- Tailwind CSS
- [Add other major dependencies]

For a complete list, see [package.json](package.json).

## 🐛 Troubleshooting

Common issues and their solutions:

1. **TypeScript errors**
   - Run `npm run type-check` to identify issues
   - Ensure all props are properly typed

2. **Build errors**
   - Clear the `.next` directory
   - Run `npm run build` again

3. **Development server issues**
   - Check if port 9002 is available
   - Clear browser cache
   - Try running `npm run dev -- --turbo` for faster development

4. **React Hydration Errors**
   If you see hydration mismatch errors:
   ```bash
   Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties
   ```
   
   Common causes and solutions:
   - Check for browser extensions that might modify the DOM
   - Ensure consistent rendering between server and client:
     ```typescript
     // ❌ Avoid this
     if (typeof window !== 'undefined') {
       // client-only code
     }
     
     // ✅ Use this instead
     'use client';
     // client-only code
     ```
   - Avoid using dynamic values that change between server and client:
     - `Date.now()`
     - `Math.random()`
     - User locale-specific formatting
   - Add `suppressHydrationWarning={true}` to elements that intentionally differ
   - Clear browser cache and restart the development server

5. **Performance Issues**
   - Use React Server Components where possible
   - Implement proper loading states
   - Use proper caching strategies
   - Monitor bundle size with `npm run build`

## 🔧 Development Tips

1. **Hot Reloading**
   - Use `--turbo` flag for faster development:
     ```bash
     npm run dev -- --turbo
     ```
   - Clear `.next` cache if hot reloading stops working:
     ```bash
     rm -rf .next
     ```

2. **Debugging**
   - Use React Developer Tools browser extension
   - Enable source maps in development
   - Use `console.log` with proper component boundaries

3. **Code Quality**
   - Run linter before committing:
     ```bash
     npm run lint
     ```
   - Check types:
     ```bash
     npm run type-check
     ```
   - Format code:
     ```bash
     npm run format
     ```

## 📄 License

[Add your license information here]

## 👥 Team

[Add team information or contact details]
