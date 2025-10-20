# ADR-002: Persistencia con MongoDB (MVP)
**Fecha** 20-10-25

## Contexto:
MindEcho necesita almacenar cuentas de usuario y sesiones (tokens de refresco). 
El MVP no guardará contenido sensible de check-ins, solo credenciales y metadatos mínimos (supuesto).

## Decisión:
Usar MongoDB y Mongoose. Índices:
- Único y case-insensitive para email (mediante campo normalizado 'emailLower').
- TTL caducidad automatica sobre 'refresh_tokens.expiresAT'.

## Motivación:
- Velocidad de iteración y esquema flexible.
- Ecosistema maduro en Node/TS.
- Menor fricción para el MVP, con opción de evolucionar a otros almacenes si hiciera falta.

## Alcance (MVP):
Colecciones:
- 'users' => credenciales y metadatos mínimos.
- 'refresh_tokens'=> gestión de sesiones (rotación, revocación).

## Modelo de datos (iniciales)
**users**
- '_id': ObjectId
- 'email': string (visual)
- 'emailLower' string (normalizado a minúscula) **index unique**
- 'passwordHash': string (bcrypt)
- 'createdAt', 'updatedAt: Date

**refresh_tokens**
- '_id': ObjectId
- 'userId': ObjectId referencia 'users' **index**
- 'token': string (hash del refresh token, nunca guarda el token en claro).
- 'expiresAt': Date **TTL**
- 'revokedAt': Date/null
- 'createdAt', 'updateAt': Date

## Índeces
- 'users': '{emailLower: 1}' **unique** , nombre 'uniq_mail_ci'.
- 'refresh_tokens':
    - '{userId: 1, token: 1}' **unique** (un hash de token por usuario), nombre 'uniq_user_token'.
    - '{ expiresAt: 1 }' **TTL** con 'expireAfterSeconds: 0', nombre 'ttl_refresh'.

## Reglas de seguridad y privacidad
- En tránsito: TLS en stage/prod (terminación en proxy / Ingress).
- En reposo: cifrado a nivel de disco/volumen en el entorno de despliegue (supuesto en cloud). En local, volumen Docker sin datos sensibles reales.
- Minimización: no registrar PII en logs; nunca guardar refresh tokens en claro (solo **hash**).
- Retención: por defecto 90 días para datos operativos (supuesto), configurable. Refresh tokens: 7 días (supuesto).
- Exportación/Borrado: endpoint de borrado de cuenta eliminará 'users' y 'refresh_tokens' asociados.

## Consistencia y performance
- Lecturas: 'readPreference: primary'.
- Escrituras: 'writeConcern: "majority"' (supuesto por operación).
- Índices garantizados al arrancar app con 'syncIndexes()'.

## Migraciones y evolución
- Cambios de esquema manejados con scripts idempotentes (seed/migrate) y 'syncIndexes()'.
- Posible evolución a particionado por usuario o mover analítica a almacén separado si crece el uso.

## Alternativas consideradas
- **PostgreSQL:** esquema rígido inicial y más trabajo de mapeo; descartado por tiempo del MVP.
- **SQLite/Drift:** pensado para cliente/embebido; no encaja como backend multiusuario.
- **Firestore/DynamoDB:** gestionados y escalables, pero cambian los costes y tooling para el curso.

## Consecuencias
- Validaciones primarias en capa de aplicación (Zod/Mongoose).
- Necesidad de normalizar email para unicidad case-insensitive.
- Gestión explícita de rotación y revocación de refresh tokens.

## Comprobación (Definition of Done)
- Índice **único** en 'users.emailLower' activo.
- Índice **TTL** operativo en 'refresh_tokens.expiresAt'.
- No existen dos usuarios con el mismo email (diferente casing).
- Tokens caducados se purgan automáticamente.