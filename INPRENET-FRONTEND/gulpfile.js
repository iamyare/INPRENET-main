const gulp = require('gulp');
const replace = require('gulp-replace');

function replaceScriptType() {
  return gulp.src('dist/**/*.html') // Ajusta la ruta a tu build
    .pipe(replace('type="module"', 'type="text/javascript"'))
    .pipe(replace('defer', 'type="text/javascript"'))
    .pipe(gulp.dest('dist')); // Ajusta la ruta de salida
}

exports.default = replaceScriptType;