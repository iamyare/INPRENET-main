import gulp from 'gulp';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import { deleteAsync } from 'del'; // Importación correcta

// Función para mover los archivos .js a la carpeta scripts
function moveJs() {
  return gulp
    .src(['dist/**/*.js', '!dist/scripts/**']) // Excluye la carpeta scripts
    .pipe(rename({ dirname: 'scripts' }))
    .pipe(gulp.dest('dist'));
}

// Función para mover los archivos .css a la carpeta styles
function moveCss() {
  return gulp
    .src(['dist/**/*.css', '!dist/styles/**']) // Excluye la carpeta styles
    .pipe(rename({ dirname: 'styles' }))
    .pipe(gulp.dest('dist'));
}

// Función para reemplazar rutas en los archivos .html
function replacePaths() {
  return gulp
    .src('dist/**/*.html')
    .pipe(replace('href="styles.', 'href="/styles/styles.'))
    .pipe(replace('<script src="polyfills', '<script src="/scripts/polyfills'))
    .pipe(replace('<script src="runtime', '<script src="/scripts/runtime'))
    .pipe(replace('<script src="scripts', '<script src="/scripts/scripts'))
    .pipe(replace('<script src="main', '<script src="/scripts/main'))
    .pipe(replace('type="module"', 'type="text/javascript"'))
    .pipe(replace('defer', 'type="text/javascript"'))
    .pipe(gulp.dest('dist'));
}

// Función para eliminar archivos .js y .css fuera de las carpetas styles y scripts
function clean() {
  return deleteAsync([
    'dist/**/*.js', // Todos los archivos .js
    'dist/**/*.css', // Todos los archivos .css
    '!dist/scripts/**', // Excluye la carpeta scripts
    '!dist/styles/**', // Excluye la carpeta styles
  ]);
}

// Exportar las tareas en serie
export default gulp.series(moveJs, moveCss, replacePaths, clean);
