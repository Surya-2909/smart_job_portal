# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Interview question research

The backend searches public interview reports with Tavily before asking Ollama to create
original practice questions. Set the Tavily API key in the backend process environment
before starting Spring Boot:

```powershell
$env:TAVILY_API_KEY = "your-tavily-api-key"
```

The key is used only by the backend and should not be committed. The interview page shows
the public source links used for each question set; generated questions are not guaranteed
to be exact or verified questions from an actual interview.

The backend also reads external-service credentials from environment variables:
`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, and `OPENAI_API_KEY` (with optional
`OPENAI_API_URL`). Set each value in the terminal or hosting environment before starting
the backend. Rotate any credentials that were previously stored in source files or shared.
