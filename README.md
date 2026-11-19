# ReportaBarrio

Aplicación web del proyecto de aula de Tecnologías Web. Permite registrar problemas del barrio y consultar los reportes y las estadísticas de la comunidad. Está desarrollada con Node.js, Express, HTML5 y CSS3, sin base de datos: la información se guarda en memoria mientras el servidor está encendido.

## Integrantes

- Juan Jimenez
- Andres Lopez

## ODS elegido

ODS 11: Ciudades y comunidades sostenibles.

La aplicación contribuye a las metas 11.1, 11.3 y 11.6, porque permite identificar necesidades de servicios básicos, priorizar mejoras del espacio público y apoyar el manejo adecuado de los residuos y del agua.

## Instalación y ejecución

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Iniciar el servidor:

   ```bash
   npm run dev
   ```

3. Abrir en el navegador:

   ```
   http://localhost:3000
   ```

También se puede iniciar con `npm start`.

## Rutas del servidor

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Página de inicio con la presentación del proyecto y del ODS 11. |
| GET | `/reportar.html` | Formulario para registrar un reporte. |
| GET | `/reportes` | Listado de reportes con filtros por categoría y barrio. |
| POST | `/reportes` | Valida y guarda un reporte; redirige al listado. |
| GET | `/estadisticas` | Conteo de reportes por categoría y por estado. |
| GET | `/cualquier-otra-ruta` | Responde con 404 y un enlace para volver al inicio. |

