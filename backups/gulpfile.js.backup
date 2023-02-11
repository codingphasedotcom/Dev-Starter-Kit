const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
var exec = require('child_process').exec;
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const prettyUrl = require('gulp-pretty-url');
var del = require('del');
const gulpEdge = require('gulp-edgejs');

// Compiles SCSS To CSS
gulp.task(
	'styles',
	gulp.series(() => {
		return gulp
			.src('assets/scss/**/*.scss')
			.pipe(
				sass({
					outputStyle: 'compressed'
				}).on('error', sass.logError)
			)
			.pipe(
				autoprefixer({
					browsers: ['last 2 versions']
				})
			)
			.pipe(gulp.dest('./public/css'))
			.pipe(browserSync.stream());
	})
);

// Use Webpack to compile latest Javascript to ES5
// Webpack on Development Mode
gulp.task(
	'webpack:dev',
	gulp.series(cb => {
		return exec('npm run dev:webpack', function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
		});
	})
);
// Webpack on Production Mode
gulp.task(
	'webpack:prod',
	gulp.series(cb => {
		return exec('npm run build:webpack', function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
		});
	})
);

// Browser-sync to get live reload and sync with mobile devices
gulp.task(
	'browser-sync',
	gulp.series(function() {
		browserSync.init({
			server: './public',
			notify: false,
			open: false, //change this to true if you want the broser to open automatically
			injectChanges: false
		});
	})
);

// Use Browser Sync With Any Type Of Backend
gulp.task(
	'browser-sync-proxy',
	gulp.series(function() {
		// THIS IS FOR SITUATIONS WHEN YOU HAVE ANOTHER SERVER RUNNING
		browserSync.init({
			proxy: {
				target: 'http://localhost:3333/', // can be [virtual host, sub-directory, localhost with port]
				ws: true // enables websockets
			}
			// serveStatic: ['.', './public']
		});
	})
);

// Minimise Your Images
gulp.task(
	'imagemin',
	gulp.series(function minizingImages() {
		return gulp
			.src('assets/img/**/*')
			.pipe(
				imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.jpegtran({ progressive: true }),
					imagemin.optipng({ optimizationLevel: 5 }),
					imagemin.svgo({
						plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
					})
				])
			)
			.pipe(gulp.dest('./public/img'));
	})
);

// This is your Default Gulp task
gulp.task(
	'default',
	gulp.parallel([
		gulp.series([
			'webpack:dev',
			'styles',
			function runningWatch() {
				gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
				gulp.watch('./assets/js/**/*', gulp.parallel('webpack:dev'));
				gulp.watch(['./public/**/*', './public/*']).on('change', reload);
			}
		]),
		gulp.series(['browser-sync'])
	])
);

// This is the task when running on a backend like PHP, PYTHON, GO, etc..
gulp.task(
	'watch-proxy',
	gulp.parallel([
		gulp.series([
			'webpack:dev',
			'styles',
			function runningWatch() {
				gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
				gulp.watch('./assets/js/**/*', gulp.parallel('webpack:dev'));
				gulp.watch(['./public/**/*', './public/*']).on('change', reload);
			}
		]),
		gulp.series(['browser-sync-proxy'])
	])
);
// This is the production build for your app
gulp.task('build', gulp.series([gulp.parallel(['styles', 'webpack:prod'])]));

/*
|--------------------------------------------------------------------------
| Static Site Generator
|--------------------------------------------------------------------------
|
| Run These commands below for static site generator
|	optional this is if you want to create a static website
|
*/
//

// Generate HTML From Pug or Edge Template Engines
gulp.task(
	'views',
	gulp.series(
		// uncomment one of these functions depending on what template engine you want to use and comment the one you don't want to use
		function buildGULPHTML() {
			return gulp
				.src([
					'assets/views/**/*.pug',
					'!assets/views/{layouts,layouts/**}',
					'!assets/views/{includes,includes/**}'
				])
				.pipe(pug({ pretty: true }))
				.pipe(gulp.dest('./temp'));
		},
		/* =================== */
		// function buildEDGEHTML() {
		// 	return gulp
		// 		.src([
		// 			'assets/views/**/*.edge',
		// 			'!assets/views/{layouts,layouts/**}',
		// 			'!assets/views/{includes,includes/**}'
		// 		])
		// 		.pipe(gulpEdge())
		// 		.pipe(gulp.dest('./temp'));
		// },
		function cleanUrl() {
			return gulp
				.src('temp/**/*.html')
				.pipe(prettyUrl())
				.pipe(gulp.dest('public'));
		}
	)
);
// Delete Your Temp Files
gulp.task(
	'cleanTemp',
	gulp.series(() => {
		return del([
			'./temp'

			//   '!public/img/**/*'
		]);
	})
);

// Tasks to generate site on development this will also have live reload
gulp.task(
	'static-dev',
	gulp.parallel([
		gulp.series([
			'views',
			'webpack:dev',
			'styles',
			'cleanTemp',
			function runningWatch() {
				gulp.watch('./assets/views/**/*', gulp.series('views'));
				gulp.watch('./assets/views/**/*', gulp.series('cleanTemp'));
				gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
				gulp.watch('./assets/js/**/*', gulp.parallel('webpack:dev'));
				gulp.watch(['./public/**/*', './public/*']).on('change', reload);
			}
		]),
		gulp.series(['browser-sync'])
	])
);

// this will run your static site for production
gulp.task(
	'static-build',
	gulp.series([
		gulp.series(['views', 'cleanTemp']),
		gulp.parallel(['styles', 'webpack:prod'])
	])
);
