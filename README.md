# CarGO frontend

Frontend Next.js 15, React 19 y TypeScript estricto integrado con la API FastAPI de CarGO. Las pantallas conservan sus modelos visuales mediante adaptadores en `src/services`; no consumen mocks en tiempo de ejecución.

El backend está en el repositorio [`cargo-backend`](https://github.com/cargo-project/cargo-backend).

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

`NEXT_PUBLIC_API_URL` apunta a `/api/v1` detrás de Nginx o a `http://localhost:8000/api/v1` en desarrollo directo. El cliente usa cookies de sesión, refresh y CSRF. El WebSocket autenticado invalida dashboard, recorrido y alertas, que se revalidan mediante REST.

Validación:

```powershell
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```
