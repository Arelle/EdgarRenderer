/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const order = require('gulp-order');
const header = require('gulp-header');

const jsFiles = [ '../js/app/**/*.js','!../js/app/compressed.js' ];

const jsProdFile = '../js';

const comment = [
  '/* Created by staff of the U.S. Securities and Exchange Commission. ',
  '* Data and content created by government employees within the scope of their employment ',
  '* are not subject to domestic copyright protection. 17 U.S.C. 105. ',
  '*/', ''
  ].join('\n')


gulp.task('default',() => {
  
  return gulp.src(jsFiles)
  .pipe(order([
    'ajax/*.js',
    'constants/*.js',
    'errors/*.js',
    'filters/*.js',
    'form-information/*.js',
    'help/*.js',
    'helpers/*.js',
    'images/*.js',
    'links/*.js',
    'menus/*.js',
    'modals/*.js',
    'pagination/*.js',
    'polyfills/*.js',
    'scroll/*.js',
    'search/*.js',
    'sections/*.js',
    'taxonomies/*.js',
    'user-filters/*.js',
    '*.js',
    'init.js',
  ]))
  .pipe(concat('production.js'))
  .pipe(gulp.dest(jsProdFile))
  .pipe(rename('production.min.js'))
  .pipe(uglify())
  .pipe(header(comment))
  .pipe(gulp.dest(jsProdFile));
  
  
});







