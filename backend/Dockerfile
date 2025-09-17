FROM node:20-alpine

# Herramientas básicas por si algún paquete las necesita
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copiamos SOLO los manifests para aprovechar la cache
COPY package*.json ./

# 👇 Asegura instalar también devDependencies (ts-node, @types/*, nodemon)
#    --include=dev funciona en npm 9/10 y evita que NODE_ENV=production las omita
RUN npm ci --include=dev

# Ahora sí, el resto del código
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000
CMD ["npm","run","start"]