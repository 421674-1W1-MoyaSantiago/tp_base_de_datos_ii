# Sistema de Gestión para Lavadero de Autos

Aplicación web full-stack para gestión integral de un lavadero de autos con seguimiento de servicios, clientes, empleados y facturación.

## 🚀 Tecnologías Utilizadas

### Backend
- **Java 21** (Records, Virtual Threads, Pattern Matching)
- **Spring Boot 3.3.0**
  - Spring Data MongoDB
  - Spring Security
  - Spring Web
  - Bean Validation
- **MongoDB** (Base de datos NoSQL)
- **JWT** (Autenticación y autorización)
- **Maven** (Gestión de dependencias)

### Frontend
- **Angular 20** (Standalone Components, Signals)
- **Angular Material** (UI Components)
- **RxJS** (Programación reactiva)
- **TypeScript**
- **SCSS** (Estilos)

## 📋 Funcionalidades Principales

### 1. Dashboard de Lavados (Kanban)
- Visualización de órdenes en 4 estados: PENDING, IN_PROGRESS, COMPLETED, DELIVERED
- Cambio de estado mediante botones de acción
- Vista en tiempo real con Signals
- Información detallada de cada orden

### 2. Gestión de Clientes
- CRUD completo de clientes
- Múltiples vehículos por cliente
- Búsqueda por nombre, DNI, teléfono
- Historial de servicios por cliente

### 3. Gestión de Empleados
- CRUD de empleados con roles (OPERATOR, ADMIN, CASHIER)
- Activación/desactivación de empleados
- Asignación a órdenes de servicio
- Autenticación basada en roles

### 4. Órdenes de Servicio
- Creación de órdenes con cliente y vehículo
- Tipos de servicio: BASIC, COMPLETE, PREMIUM, EXPRESS
- Asignación de empleados
- Seguimiento de tiempos (inicio, fin, entrega)
- Transiciones de estado validadas

### 5. Facturación
- Generación de facturas solo para órdenes completadas
- Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia)
- Reportes de ventas por período
- Desglose por método de pago

## 🛠️ Requisitos Previos

- **Java 21** o superior
- **Maven 3.9+**
- **Node.js 24+** y **npm 11+**
- **MongoDB 6.0+** (ejecutándose en puerto 27017)

## 📦 Instalación y Configuración

### Backend (Spring Boot)

1. **Navegar al directorio del backend:**
   ```bash
   cd be
   ```

2. **Instalar dependencias Maven:**
   ```bash
   mvn clean install
   ```

3. **Configurar MongoDB:**
   - Asegúrate de que MongoDB esté ejecutándose en `mongodb://localhost:27017`
   - La base de datos `lavadero_db` se creará automáticamente

4. **Ejecutar la aplicación:**
   ```bash
   mvn spring-boot:run
   ```

   El backend estará disponible en: `http://localhost:8080`

### Frontend (Angular)

1. **Navegar al directorio del frontend:**
   ```bash
   cd fe/lavadero-fe
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   ng serve
   ```

   El frontend estará disponible en: `http://localhost:4200`

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. Para iniciar sesión, primero debes crear un empleado en la base de datos:

### Crear un empleado inicial (admin)

Usa MongoDB Compass o la CLI de MongoDB para insertar:

```javascript
db.employees.insertOne({
  firstName: "Admin",
  lastName: "Sistema",
  email: "admin@lavadero.com",
  phone: "1234567890",
  role: "ADMIN",
  username: "admin",
  password: "$2a$10$8Z4.Z4gHq5xKqC5.KqC5.KqC5...", // bcrypt de "admin123"
  active: true,
  createdAt: new Date()
});
```

**Nota:** Para generar el hash BCrypt del password, puedes usar la aplicación backend creando un endpoint temporal o una herramienta online.

**Credenciales iniciales sugeridas:**
- Username: `admin`
- Password: `admin123` (deberás hashear esta contraseña con BCrypt)

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Clientes
- `GET /api/clients` - Listar clientes (paginado)
- `GET /api/clients/{id}` - Obtener cliente por ID
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/{id}` - Actualizar cliente
- `DELETE /api/clients/{id}` - Eliminar cliente
- `GET /api/clients/search?term={term}` - Buscar clientes
- `POST /api/clients/{id}/vehicles` - Agregar vehículo
- `DELETE /api/clients/{id}/vehicles/{licensePlate}` - Eliminar vehículo

### Empleados
- `GET /api/employees` - Listar empleados
- `GET /api/employees/active` - Listar empleados activos
- `GET /api/employees/{id}` - Obtener empleado por ID
- `POST /api/employees` - Crear empleado
- `PUT /api/employees/{id}` - Actualizar empleado
- `PATCH /api/employees/{id}/status` - Activar/desactivar
- `DELETE /api/employees/{id}` - Eliminar empleado

### Órdenes de Servicio
- `GET /api/service-orders` - Listar órdenes
- `GET /api/service-orders/{id}` - Obtener orden por ID
- `POST /api/service-orders` - Crear orden
- `GET /api/service-orders/status/{status}` - Filtrar por estado
- `GET /api/service-orders/by-client/{clientId}` - Por cliente
- `PATCH /api/service-orders/{id}/status` - Cambiar estado
- `PATCH /api/service-orders/{id}/assign/{employeeId}` - Asignar empleado

### Facturas
- `GET /api/invoices` - Listar facturas
- `GET /api/invoices/{id}` - Obtener factura por ID
- `POST /api/invoices` - Crear factura
- `GET /api/invoices/by-client/{clientId}` - Por cliente
- `GET /api/invoices/report?fromDate={date}&toDate={date}` - Reporte de ventas

## 🗄️ Modelo de Datos

### Client
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dni": "string",
  "vehicles": [
    {
      "licensePlate": "string",
      "brand": "string",
      "model": "string",
      "year": number,
      "color": "string"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Employee
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "role": "OPERATOR | ADMIN | CASHIER",
  "username": "string",
  "password": "string (hashed)",
  "active": boolean,
  "createdAt": "datetime"
}
```

### ServiceOrder
```json
{
  "id": "string",
  "orderNumber": "string",
  "clientId": "string",
  "vehicleLicensePlate": "string",
  "serviceType": "BASIC | COMPLETE | PREMIUM | EXPRESS",
  "status": "PENDING | IN_PROGRESS | COMPLETED | DELIVERED",
  "assignedEmployeeId": "string",
  "price": number,
  "startTime": "datetime",
  "endTime": "datetime",
  "deliveryTime": "datetime",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Invoice
```json
{
  "id": "string",
  "invoiceNumber": "string",
  "serviceOrderId": "string",
  "clientId": "string",
  "amount": number,
  "paymentMethod": "CASH | CARD | TRANSFER",
  "paymentStatus": "PENDING | PAID | CANCELLED",
  "issuedBy": "string",
  "issuedAt": "datetime",
  "notes": "string"
}
```

## 🏗️ Arquitectura del Proyecto

### Backend (Spring Boot)
```
be/
├── src/main/java/com/lavadero/
│   ├── config/          # Configuraciones (Security, MongoDB, CORS)
│   ├── controller/      # REST Controllers
│   ├── service/         # Lógica de negocio (interfaces + impl)
│   ├── repository/      # Spring Data MongoDB Repositories
│   ├── model/           # Documentos MongoDB y Enums
│   ├── dto/             # Records para Request/Response
│   ├── security/        # JWT, UserDetailsService, Filters
│   ├── exception/       # Manejo global de excepciones
│   └── LavaderoApplication.java
└── src/main/resources/
    └── application.properties
```

### Frontend (Angular 20)
```
fe/lavadero-fe/
├── src/app/
│   ├── core/
│   │   ├── guards/          # AuthGuard
│   │   ├── interceptors/    # JWT Interceptor
│   │   ├── models/          # Interfaces y Enums
│   │   └── services/        # Services con Signals
│   ├── features/
│   │   ├── auth/            # Login
│   │   ├── dashboard/       # Dashboard layout y Kanban
│   │   ├── clients/         # Gestión de clientes
│   │   ├── employees/       # Gestión de empleados
│   │   ├── services/        # Órdenes de servicio
│   │   └── billing/         # Facturación
│   ├── app.config.ts        # Configuración standalone
│   └── app.routes.ts        # Rutas
└── src/environments/
```

## 🚦 Flujo de Trabajo Típico

1. **Usuario inicia sesión** → JWT guardado en localStorage
2. **Dashboard carga órdenes** → WashService fetch con Signals
3. **Crear nueva orden:**
   - Seleccionar/crear cliente
   - Seleccionar vehículo del cliente
   - Asignar empleado
   - Definir tipo de servicio y precio
   - Estado inicial: PENDING
4. **Mover orden a IN_PROGRESS** → Timer inicia automáticamente
5. **Completar orden** → Timer termina → Habilita facturación
6. **Generar factura** → Método de pago → Estado PAID
7. **Entregar orden** → Estado DELIVERED

## 🔧 Características Técnicas Avanzadas

### Java 21
- **Records:** DTOs inmutables y concisos
- **Virtual Threads:** Mejor rendimiento en operaciones I/O con MongoDB
- **Pattern Matching:** Switch expressions en validaciones de estado

### Spring Boot
- **Spring Data MongoDB:** Repositorios con queries derivadas
- **Spring Security + JWT:** Autenticación stateless
- **Bean Validation:** Validaciones declarativas
- **Global Exception Handler:** Manejo centralizado de errores

### Angular 20
- **Standalone Components:** Sin NgModules
- **Signals:** Estado reactivo moderno
- **Control Flow (@if/@for):** Sintaxis moderna
- **inject():** Inyección funcional de dependencias
- **Lazy Loading:** Carga diferida de features

## 📝 Licencia

Este proyecto es un sistema de demostración educativa.

## 👥 Autor

Desarrollado como proyecto académico para TUP - Técnico Universitario en Programación.
