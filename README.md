# Sistema de Gestión del Ministerio de Alabanza

Aplicación web completa para administrar canciones, cifrados, músicos, eventos y programaciones del ministerio de alabanza.

---

## Tecnologías

| Capa       | Tecnología                                  |
|------------|---------------------------------------------|
| Backend    | PHP 8.2, Laravel 12, MySQL, Sanctum (SPA)   |
| Frontend   | React 18, Vite, Tailwind CSS, React Router  |
| Exportación| maatwebsite/excel (PhpSpreadsheet)          |
| Auth       | Laravel Sanctum (cookie SPA — sin tokens localStorage) |

---

## Estructura del proyecto

```
ministerio-alabanza/
├── backend/        ← API REST en Laravel
├── frontend/       ← SPA en React + Vite
└── README.md
```

---

## Requisitos previos

- PHP >= 8.2 con extensiones: pdo, pdo_mysql, fileinfo, gd
- Composer >= 2
- Node.js >= 18 y npm >= 9
- MySQL >= 8
- Git

Verificar versiones instaladas:

```powershell
php --version
composer --version
node --version
npm --version
git --version
mysql --version
```

---

## Instalación local (Windows / PowerShell)

### 1. Clonar el repositorio

```powershell
git clone <url-del-repositorio> ministerio-alabanza
cd ministerio-alabanza
```

### 2. Configurar el backend

```powershell
cd backend

# Instalar dependencias PHP
composer install

# Copiar el archivo de entorno
Copy-Item .env.example .env

# Generar la clave de la aplicación
php artisan key:generate
```

Editar `backend/.env` con los datos de tu base de datos MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ministerio_alabanza
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
```

```powershell
# Crear la base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE ministerio_alabanza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar migraciones y seeders
php artisan migrate --seed
```

El seeder crea automáticamente:
- Usuario administrador
- 8 tipos de evento (Domingo, CDO, Blaze, etc.)
- 18 funciones musicales y técnicas
- 20 canciones de muestra
- 12 integrantes de muestra con roles asignados

### 3. Configurar el frontend

```powershell
cd ..\frontend

# Instalar dependencias Node
npm install
```

### 4. Ejecutar el proyecto

Necesitas **dos terminales abiertas**:

**Terminal 1 — Backend:**
```powershell
cd backend
php artisan serve
```
→ API disponible en `http://localhost:8000`

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```
→ Aplicación disponible en `http://localhost:5173`

---

## Credenciales de acceso

| Campo    | Valor                      |
|----------|----------------------------|
| Email    | `lider@ministerio.local`   |
| Contraseña | `ministerio123`          |

> Cambiar la contraseña en producción ejecutando el seeder con valores diferentes.

---

## Módulos implementados

| Módulo | Estado |
|--------|--------|
| Autenticación (Sanctum SPA) | ✅ Completo |
| Dashboard con estadísticas reales | ✅ Completo |
| Catálogo de canciones (CRUD, filtros, paginación) | ✅ Completo |
| Cifrados en texto (por secciones) | ✅ Completo |
| Archivos adjuntos PDF/imagen (almacenamiento privado) | ✅ Completo |
| Directorio de integrantes | ✅ Completo |
| Funciones musicales configurables | ✅ Completo |
| Eventos con tipos configurables | ✅ Completo |
| Editor de programación (bloques, canciones, equipo) | ✅ Completo |
| Duplicar bloques de programación | ✅ Completo |
| Reordenar canciones en bloques | ✅ Completo |
| Plantilla visual Domingo (rosada/roja) | ✅ Completo |
| Plantilla visual CDO (morada, bloques en paralelo) | ✅ Completo |
| Plantilla general (color del tipo de evento) | ✅ Completo |
| Exportación a Excel con estilos | ✅ Completo |
| Impresión / guardar como PDF desde el navegador | ✅ Completo |
| Configuración de roles musicales | ✅ Completo |

---

## Endpoints principales de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/user` | Usuario autenticado |

### Canciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/songs` | Listar canciones (paginado, filtros) |
| POST | `/api/songs` | Crear canción |
| GET | `/api/songs/{id}` | Ver detalle |
| PUT | `/api/songs/{id}` | Actualizar |
| PATCH | `/api/songs/{id}/toggle-active` | Activar/desactivar |
| GET | `/api/songs/{id}/cipher-texts` | Listar cifrados en texto |
| POST | `/api/songs/{id}/cipher-texts` | Crear cifrado |
| GET | `/api/songs/{id}/cipher-files` | Listar archivos |
| POST | `/api/songs/{id}/cipher-files` | Subir archivo |
| GET | `/api/cipher-files/{id}/download` | Descargar archivo (autenticado) |

### Personas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/people` | Listar (paginado) |
| GET | `/api/people/all` | Todos sin paginar (para selectores) |
| POST | `/api/people` | Crear persona |
| PUT | `/api/people/{id}` | Actualizar |
| DELETE | `/api/people/{id}` | Desactivar |

### Eventos y programaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Listar eventos |
| POST | `/api/events` | Crear evento |
| GET | `/api/events/{id}` | Ver evento completo |
| GET | `/api/events/{id}/blocks` | Bloques del evento |
| POST | `/api/events/{id}/blocks` | Crear bloque |
| POST | `/api/blocks/{id}/songs` | Agregar canción al bloque |
| PUT | `/api/block-songs/{id}` | Editar canción en bloque |
| POST | `/api/blocks/{id}/assignments/bulk` | Guardar equipo del bloque |
| POST | `/api/blocks/{id}/duplicate` | Duplicar bloque |
| GET | `/api/events/{id}/export/excel` | Descargar Excel |

---

## Migraciones y seeders

```powershell
# Correr todas las migraciones
php artisan migrate

# Correr todas las migraciones + todos los seeders
php artisan migrate --seed

# Refrescar la BD (¡borra todo!) y volver a sembrar
php artisan migrate:fresh --seed

# Solo el seeder de canciones
php artisan db:seed --class=SongSeeder

# Solo el seeder de personas
php artisan db:seed --class=PersonSeeder
```

---

## Estructura de la base de datos

15 tablas principales:

```
users                  → cuenta de acceso
event_types            → tipos de evento (Domingo, CDO, Blaze...)
musical_roles          → funciones musicales y técnicas
songs                  → catálogo de canciones
cipher_texts           → cifrados en texto por secciones
cipher_files           → archivos adjuntos (PDF, imágenes)
people                 → directorio de integrantes
person_musical_role    → relación MtM personas-roles
events                 → eventos y reuniones
schedule_blocks        → bloques de programación dentro de un evento
block_songs            → canciones asignadas a un bloque
block_song_leaders     → responsables de cada canción en el bloque
block_assignments      → personas asignadas a funciones en el bloque
```

---

## Pruebas

```powershell
# Ejecutar pruebas PHP (backend)
cd backend
php artisan test

# Verificar rutas registradas
php artisan route:list --path=api

# Verificar que el sistema puede migrar limpio
php artisan migrate:fresh --seed
```

---

## Flujo completo de uso

1. Iniciar sesión con `lider@ministerio.local` / `ministerio123`
2. Ir a **Canciones** → agregar canciones al catálogo
3. En el detalle de cada canción → agregar cifrado en texto o subir PDF
4. Ir a **Integrantes** → registrar músicos y asignar funciones
5. Ir a **Eventos** → crear un evento (ej: Domingo 26 octubre)
6. Abrir el evento → usar el editor para agregar bloques
7. En cada bloque → agregar canciones del catálogo y asignar el equipo
8. Hacer clic en **"Ver programación"** para ver la plantilla visual
9. Usar **"Imprimir / PDF"** para generar el PDF listo para compartir
10. Usar **"Excel"** para descargar el archivo editable

---

## Preparación para producción

```powershell
# Backend: optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Frontend: compilar para producción
cd frontend
npm run build
# Los archivos compilados quedan en frontend/dist/
```

Variables de entorno críticas para producción en `backend/.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
SESSION_DOMAIN=tu-dominio.com
SANCTUM_STATEFUL_DOMAINS=tu-dominio.com
```

---

## Solución de problemas frecuentes

**"CSRF token mismatch" al hacer login**
→ Verificar que el proxy de Vite esté corriendo y que `vite.config.js` tenga las rutas `/api` y `/sanctum` en el proxy.

**"No se pudo cargar" en cualquier módulo**
→ Verificar que Laravel esté corriendo: `php artisan serve`
→ Verificar que las migraciones se ejecutaron: `php artisan migrate:status`

**"The bootstrap/cache directory must be present"**
→ `New-Item -ItemType Directory -Path "bootstrap\cache" -Force`

**El Excel no descarga**
→ Verificar que `maatwebsite/excel` esté instalado: `composer show maatwebsite/excel`
→ Verificar que la extensión `zip` de PHP esté habilitada (requerida por PhpSpreadsheet)

**"Class not found" en seeders**
→ `composer dump-autoload`

**El servidor de Laravel no arranca**
→ Verificar que el puerto 8000 no esté ocupado: `netstat -ano | findstr :8000`
→ Usar otro puerto: `php artisan serve --port=8001` (y actualizar `vite.config.js`)
