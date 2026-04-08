# Instrucciones de Inicio Rápido

## Paso 1: Iniciar MongoDB

Asegúrate de que MongoDB esté ejecutándose:

```bash
# En Windows (con MongoDB instalado como servicio):
net start MongoDB

# O si tienes MongoDB en otro puerto/ubicación:
mongod --port 27017 --dbpath C:\data\db
```

## Paso 2: Crear Usuario Administrador Inicial

Conéctate a MongoDB y ejecuta:

```javascript
use lavadero_db

// Crear empleado admin
// Nota: El password "admin123" está hasheado con BCrypt
db.employees.insertOne({
  firstName: "Admin",
  lastName: "Sistema",
  email: "admin@lavadero.com",
  phone: "1234567890",
  role: "ADMIN",
  username: "admin",
  // BCrypt hash de "admin123" - rounds: 10
  password: "$2a$10$dXJ3SW6G7P3R/ghSG9RM5.2B3kqkqkqkqkqkqkqkqkqkqkqkqkq", 
  active: true,
  createdAt: new Date()
});

// Crear empleado operador para pruebas
db.employees.insertOne({
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@lavadero.com",
  phone: "9876543210",
  role: "OPERATOR",
  username: "juan",
  password: "$2a$10$dXJ3SW6G7P3R/ghSG9RM5.2B3kqkqkqkqkqkqkqkqkqkqkqkqkq",
  active: true,
  createdAt: new Date()
});
```

**IMPORTANTE:** El hash de password mostrado arriba es solo un ejemplo. 

### Para generar el hash correcto de BCrypt:

**Opción 1 - Usar una API online:**
- Visita: https://bcrypt-generator.com/
- Ingresa "admin123"
- Rounds: 10
- Copia el hash generado

**Opción 2 - Usar Node.js:**
```bash
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10));"
```

**Opción 3 - Crear mediante el API después de iniciar el backend:**
```bash
# Una vez que el backend esté corriendo, usa este endpoint:
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "Sistema",
    "email": "admin@lavadero.com",
    "phone": "1234567890",
    "role": "ADMIN",
    "username": "admin",
    "password": "admin123"
  }'
```

## Paso 3: Datos de Prueba (Opcional)

Puedes agregar clientes y órdenes de prueba:

```javascript
// Cliente de ejemplo
db.clients.insertOne({
  firstName: "Carlos",
  lastName: "González",
  email: "carlos@example.com",
  phone: "1122334455",
  dni: "12345678",
  vehicles: [
    {
      licensePlate: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      color: "Blanco"
    },
    {
      licensePlate: "XYZ789",
      brand: "Honda",
      model: "Civic",
      year: 2019,
      color: "Gris"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Paso 4: Iniciar el Backend

```bash
cd be
mvn spring-boot:run
```

El backend debería iniciar en: http://localhost:8080

Verifica que esté funcionando:
```bash
curl http://localhost:8080/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Paso 5: Iniciar el Frontend

```bash
cd fe/lavadero-fe
npm install  # Solo la primera vez
ng serve
```

El frontend debería abrir en: http://localhost:4200

## Paso 6: Iniciar Sesión

1. Abre http://localhost:4200 en tu navegador
2. Ingresa las credenciales:
   - **Usuario:** admin
   - **Contraseña:** admin123
3. Deberías ver el dashboard con el tablero Kanban

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté ejecutándose
- Verifica el puerto (por defecto 27017)
- Revisa `application.properties`

### Error 401 Unauthorized en el login
- Verifica que el empleado exista en la base de datos
- Verifica que el password esté hasheado correctamente con BCrypt
- Verifica que active=true

### Error de CORS
- Verifica que el frontend esté en http://localhost:4200
- Revisa la configuración de CORS en SecurityConfig.java

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en http://localhost:8080
- Revisa el archivo environment.development.ts

## Flujo de Prueba Completo

1. **Crear un cliente:**
   - Ir a "Clientes" → "Nuevo Cliente"
   - Completar formulario y agregar vehículos

2. **Crear una orden de servicio:**
   - Ir a "Servicios" → "Nueva Orden"
   - Seleccionar cliente y vehículo
   - Asignar empleado
   - Definir tipo de servicio y precio

3. **Procesar la orden (Dashboard):**
   - PENDING → Click en "Iniciar" → IN_PROGRESS
   - IN_PROGRESS → Click en "Completar" → COMPLETED
   - COMPLETED → Click en "Entregar" → DELIVERED

4. **Facturar:**
   - Una vez COMPLETED, ir a "Facturación"
   - Crear factura para la orden
   - Seleccionar método de pago

5. **Ver reportes:**
   - Ir a "Facturación" → "Reportes"
   - Seleccionar rango de fechas
   - Ver totales por método de pago
