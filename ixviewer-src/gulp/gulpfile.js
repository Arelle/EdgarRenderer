/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

const fs = require('fs');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const order = require('gulp-order');
const header = require('gulp-header');
const sass = require('gulp-sass');
const csso = require('gulp-csso');

const jsFiles = ['../js/app/**/*.js', '!../js/production.js', '!../js/production.min.js'];

const jsProdFile = '../js';

const comment = [
  '/* Created by staff of the U.S. Securities and Exchange Commission. ',
  '* Data and content created by government employees within the scope of their employment ',
  '* are not subject to domestic copyright protection. 17 U.S.C. 105. ',
  '*/', ''
].join('\n')

gulp.task('sass', () => {
  return gulp.src('../js/scss/custom-bootstrap.scss').pipe(sass().on('error', sass.logError)).pipe(csso()).pipe(gulp.dest('../js/css'))
});

gulp.task('lint', () => {
  return gulp.src(jsFiles)
    .pipe(eslint({ configFile: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('error', (error) => {
      if(error) {
        console.log('\x1b[36m%s\x1b[0m', '*****************************************************');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '* You must fix the above Lint error(s) to continue. *');
        console.log('\x1b[36m%s\x1b[0m', '*****************************************************');
      }
    })
    
});

gulp.task('production', () => {
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
      'event-listeners.js'
    ]))
    .pipe(concat('production.js'))
    .pipe(gulp.dest(jsProdFile))
    .pipe(rename('production.min.js'))
    .pipe(uglify({compress: {drop_console: true}}))
    .pipe(header(comment))
    .pipe(gulp.dest(jsProdFile));
});

gulp.task('clean', (callback) => {
  // removes production.js
  fs.unlinkSync(`${jsProdFile}/production.js`);
  callback();
});

gulp.task('default', gulp.series('sass', 'lint', 'production', 'clean'), (done) => {
  console.log("continue");
});









