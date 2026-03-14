# Contributing to Kivo

First, thank you for showing interest in contributing to Kivo! We built this project for the **Lingo.dev Multilingual Hackathon**, but we believe open source thrives on community input.

## How Can I Contribute?

### 1. Integrating New Data Sources
Kivo's core value is ingesting text from anywhere so the `Lingo.dev` engine can translate it. If you want to add a direct integration to a new platform (e.g., Jira, Slack, Discord, AppFollow), please:
- Open an Issue describing the platform.
- Build a new tab component in `src/app/dashboard/page.tsx`.
- Document the integration requirements.

### 2. Reporting Bugs
This is a hackathon project, so bugs are expected! If you find one:
- Open an Issue with a clear title and description.
- Include steps to reproduce the bug.
- Include details about your environment (OS, Browser, Node version).

### 3. Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm run build`).
4. Format your code using standard linting rules (`npm run lint`).
5. Issue that pull request!

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Developing Locally

To test your changes locally, ensure you have your `LINGODOTDEV_API_KEY` set in your `.env.local` file. 

```bash
npm install
npm run dev
```

Remember: We want to preserve the clean, YC-startup aesthetic! If you are contributing UI, please use the existing Tailwind and Shadcn CSS patterns.
