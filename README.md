# BoC Evaluation Forms Platform 📝

Plataforma unificada de gestión de evaluaciones, formularios y encuestas.

## 🛠 Tech Stack
-   **Framework**: Next.js 15+ (App Router)
-   **Lenguaje**: TypeScript
-   **Base de Datos**: PostgreSQL
-   **ORM**: Prisma
-   **UI**: Tailwind CSS + ShadcnUI

## 🚀 Guía de Configuración para Desarrolladores

Sigue estos pasos para levantar el entorno de desarrollo localmente.

### 1. Prerrequisitos
Asegúrate de tener instalado:
-   **Node.js**: v18 o superior.
-   **pnpm**: Manejador de paquetes recomendado (`npm install -g pnpm`).
-   **PostgreSQL**: Base de datos corriendo localmente o un string de conexión válido.

### 2. Clonar el Repositorio

```bash
git clone <url-del-repo>
cd BoC_evaluation_forms_platform
```

### 3. Instalar Dependencias

```bash
pnpm install
```

### 4. Configurar Variables de Entorno

1.  Copia el archivo de ejemplo:
    ```bash
    cp .env.example .env
    ```
2.  Edita el archivo `.env` y ajusta `DATABASE_URL` con tus credenciales de PostgreSQL local.
    ```env
    DATABASE_URL="postgresql://usuario:password@localhost:5432/boc_db?schema=public"
    ```

### 5. Configurar la Base de Datos

Ejecuta las migraciones de Prisma para crear las tablas:

```bash
pnpm prisma db push
```

*(Opcional) Si deseas poblar la base de datos con datos de prueba, puedes ejecutar el seed si existe, o usar Prisma Studio para crear un usuario Admin manualmente.*

### 6. Ejecutar el Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🛠 Comandos Útiles

-   **Ver Base de Datos (GUI)**:
    ```bash
    pnpm prisma studio
    ```
-   **Generar Tipos de Prisma** (si cambias el schema):
    ```bash
    pnpm prisma generate
    ```

## 📝 Estructura del Proyecto

-   `/src/app`: Rutas del App Router.
    -   `/(dashboard)`: Rutas protegidas (Admin/User).
    -   `/(public)`: Rutas públicas (Login, Responder encuesta).
-   `/src/components/ui`: Componentes reutilizables (Shadcn).
-   `/src/lib/db`: Cliente de Prisma.
-   `/prisma/schema.prisma`: Definición del modelo de datos.