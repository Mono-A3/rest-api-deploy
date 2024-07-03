# Usa una imagen base específica de Node.js
FROM node:20.15

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto de la aplicación (ajusta según tu aplicación)
EXPOSE 3000

# Establece las variables de entorno (ajusta según tus necesidades)
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["node", "app.js"]
