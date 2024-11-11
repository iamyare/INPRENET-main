const gulp = require('gulp');
const replace = require('gulp-replace');

function replaceScriptType() {
  return gulp.src('dist/**/*.html') // Ajusta la ruta a tu build
    .pipe(replace('href="styles.', 'href="/styles/styles.'))
    .pipe(replace('<script src="polyfills', '<script src="/scripts/polyfills'))
    .pipe(replace('<script src="runtime', '<script src="/scripts/runtime'))
    .pipe(replace('<script src="scripts', '<script src="/scripts/scripts'))
    .pipe(replace('<script src="main', '<script src="/scripts/main'))
    .pipe(replace('type="module"', 'type="text/javascript"'))
    .pipe(replace('defer', 'type="text/javascript"'))
    .pipe(gulp.dest('dist')); // Ajusta la ruta de salida
}

exports.default = replaceScriptType;
