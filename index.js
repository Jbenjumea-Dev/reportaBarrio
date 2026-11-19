const express = require('express');

const app = express();
const PORT = 3000;

// ===== DATOS EN MEMORIA =====
// Cada categoría guarda el valor que viaja en el formulario y el nombre que ve el usuario.
const categorias = [
  { valor: 'vias', nombre: 'Vías y andenes' },
  { valor: 'alumbrado', nombre: 'Alumbrado público' },
  { valor: 'residuos', nombre: 'Residuos y basuras' },
  { valor: 'agua', nombre: 'Agua y alcantarillado' },
  { valor: 'espacio-publico', nombre: 'Espacio público' },
  { valor: 'seguridad-vial', nombre: 'Seguridad vial' }
];

// Los mismos barrios se usan en el formulario, en los filtros y en los datos de ejemplo.
const barrios = ['Centro', 'La Esperanza', 'San José', 'El Prado'];

const urgencias = ['baja', 'media', 'alta'];

const estados = ['Pendiente', 'En proceso', 'Resuelto'];

// Campos que el servidor revisa antes de guardar un reporte.
const camposObligatorios = [
  { nombre: 'titulo', etiqueta: 'el título' },
  { nombre: 'categoria', etiqueta: 'la categoría' },
  { nombre: 'barrio', etiqueta: 'el barrio' },
  { nombre: 'descripcion', etiqueta: 'la descripción' },
  { nombre: 'urgencia', etiqueta: 'la urgencia' },
  { nombre: 'contacto', etiqueta: 'el contacto' }
];

// Reportes de ejemplo para poder probar los filtros y las estadísticas.
// Los reportes nuevos siempre se guardan con el estado "Pendiente".
let reportes = [
  {
    id: 1,
    titulo: 'Hueco en la vía frente al parque',
    categoria: 'vias',
    barrio: 'Centro',
    descripcion: 'Hay un hueco grande que pone en riesgo a los motociclistas que pasan por la zona.',
    urgencia: 'alta',
    contacto: 'vecino1@correo.com',
    fecha: '2026-11-02',
    estado: 'En proceso'
  },
  {
    id: 2,
    titulo: 'Luminaria apagada en la carrera 5',
    categoria: 'alumbrado',
    barrio: 'Centro',
    descripcion: 'La luminaria está apagada desde hace una semana y el sector queda muy oscuro.',
    urgencia: 'media',
    contacto: 'vecino2@correo.com',
    fecha: '2026-11-05',
    estado: 'Pendiente'
  },
  {
    id: 3,
    titulo: 'Basuras acumuladas en la esquina',
    categoria: 'residuos',
    barrio: 'Centro',
    descripcion: 'Las basuras llevan tres días en la esquina y ya hay malos olores.',
    urgencia: 'alta',
    contacto: 'vecino3@correo.com',
    fecha: '2026-11-08',
    estado: 'Pendiente'
  },
  {
    id: 4,
    titulo: 'Fuga de agua en el andén',
    categoria: 'agua',
    barrio: 'El Prado',
    descripcion: 'Sale agua de una tubería y el andén permanece mojado todo el día.',
    urgencia: 'alta',
    contacto: 'vecino4@correo.com',
    fecha: '2026-11-10',
    estado: 'Resuelto'
  }
];

// Sirve para asignar el id del siguiente reporte.
let siguienteId = 5;

// ===== CONFIGURACIÓN DE EXPRESS =====
// Permite leer los datos que llegan por POST desde el formulario.
app.use(express.urlencoded({ extended: true }));

// Permite usar los archivos de la carpeta public (HTML, CSS e imágenes).
app.use(express.static('public'));

// ===== FUNCIONES AUXILIARES =====
// Devuelve el nombre legible de una categoría a partir de su valor.
function nombreCategoria(valor) {
  const categoria = categorias.find((item) => item.valor === valor);
  if (categoria) {
    return categoria.nombre;
  }
  return valor;
}

// Devuelve la clase CSS que corresponde al estado del reporte.
function claseEstado(estado) {
  if (estado === 'En proceso') {
    return 'proceso';
  }
  if (estado === 'Resuelto') {
    return 'resuelto';
  }
  return 'pendiente';
}

// Genera el encabezado con el logo y el menú. Recibe la sección activa para resaltarla.
function crearEncabezado(activo) {
  const claseInicio = activo === 'inicio' ? ' class="activo" aria-current="page"' : '';
  const claseReportar = activo === 'reportar' ? ' class="activo" aria-current="page"' : '';
  const claseReportes = activo === 'reportes' ? ' class="activo" aria-current="page"' : '';
  const claseEstadisticas = activo === 'estadisticas' ? ' class="activo" aria-current="page"' : '';

  return `
    <header class="encabezado">
      <a class="logo" href="/">
        <img src="/img/logo.svg" alt="Logo de ReportaBarrio">
        <span>ReportaBarrio</span>
      </a>
      <nav class="menu">
        <a href="/"${claseInicio}>Inicio</a>
        <a href="/reportar.html"${claseReportar}>Reportar</a>
        <a href="/reportes"${claseReportes}>Reportes</a>
        <a href="/estadisticas"${claseEstadisticas}>Estadísticas</a>
      </nav>
    </header>
  `;
}

// Genera el pie de página. También se repite en todas las páginas.
function crearPie() {
  return `
    <footer class="pie">
      <p>ReportaBarrio - Proyecto de aula de Tecnologías Web</p>
      <p>ODS 11: Ciudades y comunidades sostenibles</p>
    </footer>
  `;
}

// Arma una página HTML completa con el encabezado, el contenido y el pie.
function crearPagina(titulo, contenido, activo) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titulo} | ReportaBarrio</title>
      <link rel="stylesheet" href="/estilos.css">
    </head>
    <body>
      ${crearEncabezado(activo)}
      ${contenido}
      ${crearPie()}
    </body>
    </html>
  `;
}

// Crea las opciones del select de categorías y marca la que viene en el filtro.
function crearOpcionesCategorias(seleccionada) {
  return categorias.map((categoria) => `
    <option value="${categoria.valor}"${categoria.valor === seleccionada ? ' selected' : ''}>${categoria.nombre}</option>
  `).join('');
}

// Crea las opciones del select de barrios y marca la que viene en el filtro.
function crearOpcionesBarrios(seleccionado) {
  return barrios.map((barrio) => `
    <option value="${barrio}"${barrio === seleccionado ? ' selected' : ''}>${barrio}</option>
  `).join('');
}

// Crea la tarjeta de un reporte con la misma estructura para el listado.
function crearTarjetaReporte(reporte) {
  return `
    <article class="tarjeta reporte">
      <h2>${reporte.titulo}</h2>
      <p class="etiqueta">${nombreCategoria(reporte.categoria)}</p>
      <p class="datos">Barrio: ${reporte.barrio}</p>
      <p class="datos">Fecha: ${reporte.fecha}</p>
      <p class="descripcion">${reporte.descripcion}</p>
      <p class="urgencia ${reporte.urgencia}">Urgencia: ${reporte.urgencia}</p>
      <p class="estado ${claseEstado(reporte.estado)}">Estado: ${reporte.estado}</p>
      <p class="datos">Contacto: ${reporte.contacto}</p>
    </article>
  `;
}

// ===== RUTAS DEL SERVIDOR =====

// Listado de reportes con filtros por categoría y barrio.
app.get('/reportes', (req, res) => {
  const categoria = req.query.categoria || '';
  const barrio = req.query.barrio || '';

  // Se empieza con todos los reportes y se filtra solo si llega cada dato.
  let lista = reportes;

  if (categoria !== '') {
    lista = lista.filter((reporte) => reporte.categoria === categoria);
  }

  if (barrio !== '') {
    lista = lista.filter((reporte) => reporte.barrio === barrio);
  }

  // Si no hay resultados se muestra un mensaje en lugar de las tarjetas.
  let contenidoTarjetas = '';
  if (lista.length === 0) {
    contenidoTarjetas = `
      <p class="vacio">No se encontraron reportes con esos filtros.</p>
      <a class="volver" href="/reportes">Quitar filtros</a>
    `;
  } else {
    contenidoTarjetas = `
      <div class="tarjetas">
        ${lista.map(crearTarjetaReporte).join('')}
      </div>
    `;
  }

  res.send(crearPagina('Reportes del barrio', `
    <main class="contenido">
      <section>
        <h1>Reportes del barrio</h1>
        <p>Consulta los problemas que han reportado los vecinos y filtra por categoría o por barrio.</p>

        <!-- Formulario de filtros: usa GET, por eso los datos llegan en req.query. -->
        <form class="filtros" method="GET" action="/reportes">
          <div class="campo-filtro">
            <label for="categoria">Categoría</label>
            <select id="categoria" name="categoria">
              <option value="">Todas las categorías</option>
              ${crearOpcionesCategorias(categoria)}
            </select>
          </div>

          <div class="campo-filtro">
            <label for="barrio">Barrio</label>
            <select id="barrio" name="barrio">
              <option value="">Todos los barrios</option>
              ${crearOpcionesBarrios(barrio)}
            </select>
          </div>

          <button type="submit">Filtrar</button>
          <a class="volver" href="/reportes">Ver todos</a>
        </form>

        <p class="nota">Mostrando ${lista.length} de ${reportes.length} reportes.</p>

        ${contenidoTarjetas}
      </section>

      <aside class="aviso">
        <h2>Filtros combinados</h2>
        <p>Puedes elegir una categoría, un barrio o las dos opciones al mismo tiempo.</p>
        <p>Si no aparece ningún reporte, prueba con otro filtro o usa el enlace "Ver todos".</p>
      </aside>
    </main>
  `, 'reportes'));
});

// Recibe el formulario y guarda el reporte si todos los datos son válidos.
app.post('/reportes', (req, res) => {
  // Los datos de un formulario POST llegan en req.body.
  const datos = {
    titulo: (req.body.titulo || '').trim(),
    categoria: (req.body.categoria || '').trim(),
    barrio: (req.body.barrio || '').trim(),
    descripcion: (req.body.descripcion || '').trim(),
    urgencia: (req.body.urgencia || '').trim(),
    contacto: (req.body.contacto || '').trim()
  };

  // Validación en el servidor: se revisa cada campo obligatorio.
  const errores = [];

  camposObligatorios.forEach((campo) => {
    if (datos[campo.nombre] === '') {
      errores.push(`Falta ${campo.etiqueta}.`);
    }
  });

  // También se revisa que los valores de los select y los radios sean válidos.
  const categoriasValidas = categorias.map((categoria) => categoria.valor);

  if (datos.categoria !== '' && !categoriasValidas.includes(datos.categoria)) {
    errores.push('La categoría seleccionada no es válida.');
  }

  if (datos.barrio !== '' && !barrios.includes(datos.barrio)) {
    errores.push('El barrio seleccionado no es válido.');
  }

  if (datos.urgencia !== '' && !urgencias.includes(datos.urgencia)) {
    errores.push('La urgencia debe ser baja, media o alta.');
  }

  // Si hay errores se responde con 400 y no se guarda nada.
  if (errores.length > 0) {
    const listaErrores = errores.map((error) => `<li>${error}</li>`).join('');

    res.status(400).send(crearPagina('Reporte no enviado', `
      <main class="contenido-simple">
        <section class="mensaje-error">
          <h1>No se pudo guardar el reporte</h1>
          <p>Revisa la información del formulario:</p>
          <ul>${listaErrores}</ul>
          <a class="volver" href="/reportar.html">Volver al formulario</a>
        </section>
      </main>
    `, 'reportar'));
    return;
  }

  // Si todo está bien se guarda el reporte y se redirige al listado.
  reportes.push({
    id: siguienteId,
    titulo: datos.titulo,
    categoria: datos.categoria,
    barrio: datos.barrio,
    descripcion: datos.descripcion,
    urgencia: datos.urgencia,
    contacto: datos.contacto,
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'Pendiente'
  });

  siguienteId = siguienteId + 1;

  res.redirect('/reportes');
});

// Estadísticas: conteo de reportes por categoría y por estado.
app.get('/estadisticas', (req, res) => {
  // Se inicializan los contadores en cero para todas las categorías y estados.
  const conteoCategorias = {};
  categorias.forEach((categoria) => {
    conteoCategorias[categoria.valor] = 0;
  });

  const conteoEstados = {};
  estados.forEach((estado) => {
    conteoEstados[estado] = 0;
  });

  // Se recorre el arreglo y se suma uno en la categoría y en el estado de cada reporte.
  reportes.forEach((reporte) => {
    conteoCategorias[reporte.categoria] = conteoCategorias[reporte.categoria] + 1;
    conteoEstados[reporte.estado] = conteoEstados[reporte.estado] + 1;
  });

  const tarjetasCategorias = categorias.map((categoria) => `
    <article class="tarjeta">
      <h3>${categoria.nombre}</h3>
      <p class="numero">${conteoCategorias[categoria.valor]}</p>
      <p class="datos">reporte(s)</p>
    </article>
  `).join('');

  const tarjetasEstados = estados.map((estado) => `
    <article class="tarjeta">
      <h3>${estado}</h3>
      <p class="numero">${conteoEstados[estado]}</p>
      <p class="datos">reporte(s)</p>
    </article>
  `).join('');

  res.send(crearPagina('Estadísticas', `
    <main class="contenido">
      <section>
        <h1>Estadísticas de los reportes</h1>
        <p>Total de reportes registrados: <strong>${reportes.length}</strong></p>

        <h2>Reportes por categoría</h2>
        <div class="tarjetas">
          ${tarjetasCategorias}
        </div>

        <h2>Reportes por estado</h2>
        <div class="tarjetas">
          ${tarjetasEstados}
        </div>
      </section>

      <aside class="aviso">
        <h2>¿Cómo se calculan?</h2>
        <p>El servidor recorre el arreglo de reportes y suma uno en la categoría y en el estado de cada reporte.</p>
        <p>Los datos viven en memoria, así que el conteo se reinicia cuando se apaga el servidor.</p>
      </aside>
    </main>
  `, 'estadisticas'));
});

// ===== RUTA 404 =====
// Se ejecuta cuando ninguna ruta anterior respondió.
app.use((req, res) => {
  res.status(404).send(crearPagina('Página no encontrada', `
    <main class="contenido-simple">
      <section class="mensaje-error">
        <h1>404 - Página no encontrada</h1>
        <p>La dirección que buscas no existe en este servidor.</p>
        <a class="volver" href="/">Volver al inicio</a>
      </section>
    </main>
  `));
});

// Inicia el servidor en el puerto 3000.
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
