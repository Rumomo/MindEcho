## ADR-003: Autenticación con JWT más Refresh (MVP)
**Fecha:**20-10-2025

## Contexto:
MindEcho necesita sesiones seguras para la app móvil (Flutter) sin mantener estado en servidor. Qioerp pedir credenciales, emitir tokens y poder renovar sesión sin re-login frecuente.

## Decisión:
Usar **JWT** de acceso corto más **refresh token** mas largo con **rotación:**
- **Access token:** (HS256, 'exp = 15m') => se envía en 'Authorization: Bearer'.
- **Refresh token:** (duración 7 días) => **NO** se guarda en claro, se guarda **hash (SHA-256)** en 'refresh_tokens'.
- **Rotación:** en cada 'login'/'refresh' se emite un refresh nuevo y se **revoca** el anterior.
- **Logout:** revoca el refresh recibido.

## Motivación:
- Stateless y simple (encaja con Dacker y CI).
- Compatible con móvil (almacenamiento seguro en app).
- Fácil de instrumentar y auditar.

## Alcance (MVP)
Endpoints:
- 'POST /auth/register' => crea usuario (email único) + emite tokens.
- 'POST /auth/login' => valida credenciales + emite tokens.
- 'POST /auth/refresh' => recibe refresh, rota y emite par nuevo.
- 'POST /auth/logout' => revoca refresh actual.
- 'GET /users/me' => requiere 'Bearer' (JWT de acceso).

## Seguridad
- 'JWT_SECRET' robusto en '.env' (=>32 caracteres).  
- Nunca loguear tokens ni emails (logs sin PII).
- **Refresh** guardado como **hash**, 'expiresAt' con índice **TTL** (ya definido).
- Rate-limit activo en API (ya configurado).

## Alternativas consideradas (Pendiente)
- Cookies httpOnly + CSRF (web) => fuera del MVP móvil.
- Sesiones de servidor (stateful) => más complejidad y acoplamiento.
- OAuth2/OIDC => exceso para MVP.

## DoD (definición de hecho)
- Todos los endpoints funcionando.
- Rotación efectiva (el refresh antiguo ya no sirve).
- 'users/me' responde con usuario **sanitizado** (sin 'passwordHash').
