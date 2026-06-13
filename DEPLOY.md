# EduCall — GitHub & Deployment Guide

## Prerequisites
- Git installed (`git --version` to check)
- Node.js 18+ installed (`node --version` to check)
- A GitHub account (github.com)

---

## Step 1 — Create the GitHub repository

1. Go to **github.com** → click **+** → **New repository**
2. Name: `educall`
3. Visibility: **Public** (required for free GitHub Pages)
4. Do NOT tick "Add a README" — leave empty
5. Click **Create repository**

---

## Step 2 — Open Terminal in the educall folder

**Mac / Linux:**
```bash
cd ~/Downloads/educall
```

**Windows (Command Prompt):**
```cmd
cd %USERPROFILE%\Downloads\educall
```

---

## Step 3 — Set up Git and push to GitHub

Run these commands one at a time.
Replace `YOUR-USERNAME` with your actual GitHub username.

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/educall.git
git branch -M main
git add .
git commit -m "EduCall — initial React build"
git push -u origin main
```

When prompted for password — use a **Personal Access Token**, not your GitHub password.
Generate one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
Give it the "repo" scope.

---

## Step 4 — Install dependencies and deploy live

```bash
npm install
npm run deploy
```

This builds the React app and pushes it to the `gh-pages` branch automatically.

Your live URL will be:
**https://ariegold.github.io/educall**

(Takes ~60 seconds to go live the first time.)

---

## Every future update

```bash
# Save changes to GitHub
git add .
git commit -m "describe what you changed"
git push

# Rebuild and redeploy live site
npm run deploy
```

---

## Project structure

```
educall/
├── package.json              ← scripts, dependencies
├── .gitignore                ← tells Git what NOT to upload
├── public/
│   └── index.html            ← root HTML
└── src/
    ├── App.js                ← root routing
    ├── index.js              ← entry point
    ├── styles/globals.css    ← design tokens
    ├── context/              ← AuthContext, AppContext
    ├── components/
    │   ├── layout/           ← Sidebar, TopBar, AppShell
    │   └── ui/               ← Button, Card, Badge, Modal...
    ├── pages/                ← 12 pages (Login → Kiosk)
    ├── data/seedData.js      ← demo data
    ├── hooks/useToast.js
    └── utils/                ← api.js, helpers.js
```

## Demo login
Any email, any password — role tab sets your view (Admin / Teacher / Kiosk)

Built by Mythros Support Services Ltd — Company No. 16384279
