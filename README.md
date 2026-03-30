# 🛡️ ChatBunker — Frontend (Cyberpunk Security)

**ChatBunker** es la interfaz oficial de mensajería cifrada construida para máxima privacidad y seguridad. Este frontend implementa la capa de criptografía local necesaria para que el servidor nunca conozca el contenido de tus mensajes.

---

## 🔐 Pilares Técnicos

*   **Cifrado E2EE Client-Side:** Implementa la Web Crypto API para generar pares de claves Diffie-Hellman y derivar secretos compartidos locales. Todo el cifrado (AES-GCM) ocurre en el navegador antes de salir a la red.
*   **Tiempo Real (WebSockets):** Sincronización instantánea mediante una capa de WebSockets que maneja tanto el intercambio de mensajes como el handshake criptográfico de sesión.
*   **Estética Cyberpunk:** Interfaz moderna con modo oscuro profundo, efectos de cristal (glassmorphism), animaciones fluidas con **Framer Motion** y una tipografía técnica impecable.
*   **Seguridad JWT:** Manejo avanzado de sesiones con rotación automática de Access y Refresh Tokens, interceptores de Axios y almacenamiento seguro.

---

## 🛠️ Stack Tecnológico

*   **Framework:** React 18 (Vite) + TypeScript
*   **Estilos:** Tailwind CSS + PostCSS
*   **Animaciones:** Framer Motion
*   **Iconografía:** Lucide React
*   **Estado Global:** React Context API (AuthContext y ChatContext)
*   **Comunicación:** Axios (REST) + Native WebSockets

---

## 📁 Estructura del Código

```text
src/
├── api/          # Clientes Axios y lógica de WebSockets
├── components/   # Componentes atómicos (Avatar, MessageBubble, Modales)
├── context/      # Proveedores de estado (Autenticación y Chat E2EE)
├── hooks/        # Lógica reutilizable
├── pages/        # Vistas principales (Login, Register, Dashboard)
├── types/        # Definiciones estrictas de TypeScript
└── utils/        # Criptografía (Web Crypto API) y Storage
```

---

## 🔗 Integración con el Backend

Este frontend está diseñado para conectarse con el **BackEnd de ChatBunker (Django)**. Para configurar la conexión en desarrollo, revisa `vite.config.ts` o configura la variable de entorno base en `api/client.ts`.

### Flujo de Seguridad E2EE:
1.  **Conexión:** El cliente abre un WebSocket con el servidor.
2.  **Handshake:** Los clientes intercambian claves públicas efímeras a través de un mensaje tipo `key_exchange`.
3.  **Derivación:** El cliente genera una clave secreta local (AES-GCM) usando su clave privada y la pública del otro usuario.
4.  **Cifrado:** Cada mensaje se cifra localmente antes de ser enviado por el socket.

---

## 🚀 Instalación y Despliegue

### Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### GitHub Pages (Producción)
1.  Actualiza la URL del backend en `src/api/client.ts`.
2.  Ejecuta `npm run build`.
3.  Sube la carpeta `dist` a GitHub Pages o usa un Action automatizado.

---

## 🎨 Diseño Visual
*   **Paleta:** Negro profundo, Cyan Neón (#00f3ff) y Violeta Neón (#bc00ff).
*   **Efectos:** Blur de fondo, bordes brillantes y animaciones de entrada/salida.
