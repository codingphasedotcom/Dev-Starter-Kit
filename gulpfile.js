import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import { exec } from 'child_process';
import pug from 'gulp-pug';
import imagemin from 'gulp-imagemin';
import prettyUrl from 'gulp-pretty-url';
import del from 'del';
import gulpEdge from 'gulp-edgejs';

const reload = browserSync.reload;


// Compiles SCSS To CSS
export const styles = gulp.series(() => {
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
});

// Use Webpack to compile latest Javascript to ES5
// Webpack on Development Mode
export const webpackDev = gulp.series(cb => {
	return exec('npm run dev:webpack', function(err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});
// Webpack on Production Mode
export const webpackProd = gulp.series(cb => {
	return exec('npm run build:webpack', function(err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

// Browser-sync to get live reload and sync with mobile devices
export const browsersync = gulp.series(function() {
	browserSync.init({
		server: './public',
		notify: false,
		open: false, //change this to true if you want the broser to open automatically
		injectChanges: false
	});
});

// Use Browser Sync With Any Type Of Backend
export const browserSyncProxy = gulp.series(function() {
	// THIS IS FOR SITUATIONS WHEN YOU HAVE ANOTHER SERVER RUNNING
	browserSync.init({
		proxy: {
			target: 'http://localhost:3333/', // can be [virtual host, sub-directory, localhost with port]
			ws: true // enables websockets
		}
		// serveStatic: ['.', './public']
	});
});

// Minimise Your Images
export const imageMin = () => {
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
};

// This is your Default Gulp task
export const start = gulp.series(
  webpackDev,
  styles,
  function watch() {
    gulp.watch('./assets/scss/**/*', styles);
    gulp.watch('./assets/js/**/*', webpackDev);
    gulp.watch(['./public/**/*', './public/*']).on('change', reload);
  },
  browsersync
);

// This is the task when running on a backend like PHP, PYTHON, GO, etc..
export const watchProxy = gulp.parallel(
  gulp.series(webpackDev, styles, function runningWatch() {
    gulp.watch('./assets/scss/**/*', styles);
    gulp.watch('./assets/js/**/*', webpackDev);
    gulp.watch(['./public/**/*', './public/*']).on('change', reload);
  }),
  browserSyncProxy
);

// This is the production build for your app
export const build = gulp.series(gulp.parallel(styles, webpackProd));

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
const buildTemplate = (templateEngine) => {
  return gulp
    .src([
      'assets/views/**/*.' + templateEngine,
      '!assets/views/{layouts,layouts/**}',
      '!assets/views/{includes,includes/**}'
    ])
    .pipe(templateEngine === 'pug' ? pug({ pretty: true }) : gulpEdge())
    .pipe(gulp.dest('./temp'));
};

export const cleanUrls = gulp.series(function cleanUrl() {
	return gulp
		.src('temp/**/*.html')
		.pipe(prettyUrl())
		.pipe(gulp.dest('public'));
});

const selectedEngine = process.env.TEMPLATE_ENGINE || 'pug';

export const views = gulp.series(buildTemplate(selectedEngine), cleanUrls);

// Delete Your Temp Files
export const cleanTemp = gulp.series(() => {
	return del([
		'./temp'

		//   '!public/img/**/*'
	]);
});

// Tasks to generate site on development this will also have live reload
export const staticDev = gulp.series(
	views,
	webpackDev,
	styles,
	cleanTemp,
	function runningWatch() {
		gulp.watch('./assets/views/**/*', gulp.series(views, cleanTemp));
		gulp.watch('./assets/scss/**/*', styles);
		gulp.watch('./assets/js/**/*', webpackDev);
		gulp.watch(['./public/**/*', './public/*']).on('change', reload);
	},
	browsersync
);

// this will run your static site for production
export const staticBuild = gulp.series(
	gulp.series(views, cleanTemp),
	gulp.parallel([styles, webpackProd])
);
