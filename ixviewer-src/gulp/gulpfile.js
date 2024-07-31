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

const distDir = '../../../dist/ix23';
const distJsDir = '../../../dist/ix23/js';
const devDir = '../js';

const comment = [
	'/* Created by staff of the U.S. Securities and Exchange Commission. ',
	'* Data and content created by government employees within the scope of their employment ',
	'* are not subject to domestic copyright protection. 17 U.S.C. 105. ',
	'*/', ''
].join('\n')

gulp.task('sass', () => {
	return gulp.src('../js/scss/custom-bootstrap.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(csso())
		.pipe(gulp.dest(`${distJsDir}/css`))
		.pipe(gulp.dest(`${devDir}/css`))
});

gulp.task('lint', () => {
	return gulp.src(jsFiles)
		.pipe(eslint({ configFile: '.eslintrc.json' }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.on('error', (error) => {
			if (error) {
				console.log('\x1b[36m%s\x1b[0m', '*****************************************************');
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
		.pipe(gulp.dest(distJsDir))
		.pipe(gulp.dest(devDir))
		.pipe(rename('production.min.js'))
		.pipe(uglify({ compress: { drop_console: false } }))
		.pipe(header(comment))
		.pipe(gulp.dest(distJsDir))
		.pipe(gulp.dest(devDir))
});

gulp.task('development', () => {
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
		.pipe(concat('production.min.js'))
		.pipe(gulp.dest(devDir))
});

gulp.task('copyLibsToDist', () => {
	const resourcesToCopy = [
		'../js/lib/*',
	];
	return gulp.src(resourcesToCopy)
		.pipe(gulp.dest(`${distDir}/js/lib`));
})
gulp.task('copyFontAwesomeCssToDist', () => {
	return gulp.src(['../js/lib/fontawesome/css/all.min.css'])
		.pipe(gulp.dest(`${distDir}/js/lib/fontawesome/css`));
})
gulp.task('copyFontAwesomeFontsToDist', () => {
	return gulp.src(['../js/lib/fontawesome/webfonts/*.woff2'])
		.pipe(gulp.dest(`${distDir}/js/lib/fontawesome/webfonts`));
})
gulp.task('copyHtmlToDist', () => {
	return gulp.src(['../ix.html'])
		.pipe(gulp.dest(distDir));
})
gulp.task('copyCssToDist', () => {
	return gulp.src(['../js/css/app.css'])
		.pipe(gulp.dest(`${distDir}/js/css`));
})

gulp.task('clean', (callback) => {
	// removes production.js
	fs.unlinkSync(`${distJsDir}/production.js`);
	fs.unlinkSync(`${devDir}/production.js`);
	callback();
});

gulp.task('watch', () => {
	gulp.watch(jsFiles, gulp.series(['development']));
	gulp.watch('../js/scss/custom-bootstrap.scss', gulp.series(['sass']));
});

gulp.task('default', 
	gulp.series(
		'sass', 
		'lint',
		'production',
		'copyLibsToDist',
		'copyHtmlToDist',
		'copyCssToDist', 
		'copyFontAwesomeCssToDist', 
		'copyFontAwesomeFontsToDist', 
		'clean',
	), (done) => {
		console.log("continue");
	}
);
