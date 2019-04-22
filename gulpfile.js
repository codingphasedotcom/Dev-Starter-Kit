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

gulp.task(
	'browser-sync',
	gulp.series(function() {
		browserSync.init({
			server: './public',
			notify: false,
			open: false //change this to true if you want the broser to open automatically
		});
	})
);

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

// optional this is if you want to create a static website
gulp.task(
	'views',
	gulp.series(function buildHTML() {
		return gulp
			.src('assets/views/**/*.pug')
			.pipe(pug())
			.pipe(gulp.dest('./temp'));
	})
);

gulp.task(
	'cleanTemp',
	gulp.series(() => {
		return del([
			'./temp'
			//   '!public/img/**/*'
		]);
	})
);

gulp.task(
	'pretty-urls',
	gulp.series(function() {
		return gulp
			.src('temp/**/*.html')
			.pipe(prettyUrl())
			.pipe(gulp.dest('public'));
	})
);

gulp.task(
	'imagemin',
	gulp.series(function buildHTML() {
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

gulp.task(
	'default',
	gulp.parallel([
		gulp.series([
			'views',
			'pretty-urls',
			'webpack:dev',
			'styles',
			function runningWatch() {
				gulp.watch('./assets/views/**/*', gulp.parallel('views'));
				gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
				gulp.watch('./assets/js/**/*', gulp.parallel('webpack:dev'));
				gulp
					.watch([
						'./public/**/*',
						'./public/*',
						'!public/js/**/.#*js',
						'!public/css/**/.#*css'
					])
					.on('change', reload);
			}
		]),
		gulp.series(['browser-sync'])
	])
);

gulp.task(
	'watch-proxy',
	gulp.parallel([
		gulp.series([
			'webpack:dev',
			'styles',
			function runningWatch() {
				gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
				gulp.watch('./assets/js/**/*', gulp.parallel('webpack:dev'));
				gulp
					.watch([
						'./public/**/*',
						'./public/*',
						'!public/js/**/.#*js',
						'!public/css/**/.#*css'
					])
					.on('change', reload);
			}
		]),
		gulp.series(['browser-sync-proxy'])
	])
);

gulp.task(
	'build',
	gulp.series([
		gulp.series(['views', 'pretty-urls']),
		gulp.parallel(['styles', 'webpack:prod']),
		gulp.series(['cleanTemp'])
	])
);
