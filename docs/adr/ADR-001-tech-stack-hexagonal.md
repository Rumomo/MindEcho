# ADR-001: Conjunto de tecnologías y arquitectura
Fecha: 20-10-2025
Decisión:
Usar Node.js + TypeScript + Express + MongoDB con arquitectura hexagonal ligera

# Motivación:
Velocidad para el MVP(Producto mínimo viable), ecosistema maduro, buen DX y facilidad para puertos/adaptadores.

# Criterios de elección
Velocidad de entrega MVP: y curva de aprendizaje.
DX: (TypeScript, tooling ya montado en el repo).
Ecosistema y comunidad para libs (auth, seguridad, logging).
Costo operativo y simplicidad (Docker Compose sencillo).

# Alternativas consideradas:
NestJS: más  "framework", curva mayor para el MVP.
FastAPI (Python): cambio de stack y tooling.
Spring Boot (Java): más pesado para este alcance.

# Consecuencias:
Separación dominio/aplicación/infra, test por caso uso, adaptadores HTTP/DB/LLM enchufables.