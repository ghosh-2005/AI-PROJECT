# Sales Predictor Pro

A modern web application for predicting advertisement sales using machine learning. Input TV, Radio, Newspaper, and Digital ad budgets to forecast expected sales with confidence scores.

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## ✨ Features

- **ML-Powered Sales Prediction**: Predict sales based on advertising budgets
- **Multi-Channel Analysis**: Support for TV, Radio, Newspaper, and Digital advertising
- **Confidence Scoring**: Get confidence levels for predictions
- **Prediction History**: Track and review past predictions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Built-in dark theme support
- **Real-time Updates**: Instant prediction results

## 🛠️ Technologies Used

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (Database & Edge Functions)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **pnpm**
- **Git** - [Download here](https://git-scm.com/)
- A code editor (VS Code recommended)

To verify your installations:

```bash
node --version
npm --version
git --version
```

## 🚀 Installation

Follow these steps to set up the project locally:

### Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
```

Or download the ZIP file and extract it.

### Step 2: Navigate to Project Directory

```bash
cd sales-predictor-pro-main
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 4: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Get these credentials from your [Supabase Dashboard](https://supabase.com/dashboard)

## 💻 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will open at: **http://localhost:8080**

### Preview Production Build

To preview the production build locally:

```bash
# First, build the project
npm run build

# Then preview it
npm run preview
```

## 🏗️ Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

This generates optimized files in the `dist` folder.

### Step 2: Test the Build Locally

```bash
npm run preview
```

### Step 3: Check Build Output

The `dist` folder will contain:
- Minified JavaScript files
- Optimized CSS files
- Static assets
- `index.html`

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add environment variables in Vercel dashboard.

### Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Deploy to GitHub Pages

1. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/sales-predictor-pro"
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deploy script:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
sales-predictor-pro-main/
├── public/              # Static files
│   └── robots.txt
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── NavLink.tsx
│   │   ├── PredictionForm.tsx
│   │   ├── PredictionHistory.tsx
│   │   └── PredictionResult.tsx
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Third-party integrations
│   │   └── supabase/   # Supabase client & types
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # App entry point
│   └── index.css       # Global styles
├── supabase/           # Supabase configuration
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── .env                # Environment variables (create this)
├── index.html          # HTML template
├── package.json        # Dependencies & scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Important**: Never commit the `.env` file to version control!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use, modify `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 3000, // Change to any available port
}
```

### Build Errors

Clear cache and reinstall:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Supabase Connection Issues

- Verify your `.env` file has correct credentials
- Check if Supabase project is active
- Ensure API keys have proper permissions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Happy Predicting! 🚀**
