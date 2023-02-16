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

const { parallel, series } = gulp;
const reload = browserSync.reload;

// Compiles SCSS To CSS
function compileStyles() {
    // Use require('sass') instead of default gulp-sass compiler
    const sassCompiler = sass(require('sass'));

    return gulp
        .src('assets/scss/**/*.scss')
        .pipe(sassCompiler({
            outputStyle: 'compressed'
        }).on('error', sassCompiler.logError))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 2 versions']
            })
        )
        .pipe(gulp.dest('./public/css'))
        .on('error', (err) => {
            console.log(`Error in styles task: ${err.message}`);
        })
        .pipe(browserSync.stream())
        .on('error', (err) => {
            console.log(`Error in styles task: ${err.message}`);
        });
}
gulp.task('styles', compileStyles);

// Use Webpack to compile latest Javascript to ES5
// Webpack on Development Mode
function runWebpackDev(cb) {
    exec('NODE_ENV=dev webpack --mode development', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
            console.log(`Error in webpack:dev task: ${err.message}`);
        }
        cb(err);
    });
}
gulp.task('webpack:dev', series(runWebpackDev));

// Webpack on Production Mode
function runWebpackProd(cb) {
    exec('npm run build:webpack', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
}
gulp.task('webpack:prod', series(runWebpackProd));

// Browser-sync to get live reload and sync with mobile devices
function initBrowserSync() {
    try {
        browserSync.init({
            server: './public',
            notify: false,
            open: false,
            injectChanges: false
        });
    } catch (err) {
        console.error('Error initializing browser-sync: ', err);
    }
}
gulp.task('browser-sync', series(initBrowserSync));

// Use Browser Sync With Any Type Of Backend
function proxyBrowserSync() {
    // THIS IS FOR SITUATIONS WHEN YOU HAVE ANOTHER SERVER RUNNING
    try {
        browserSync.init({
            proxy: {
                target: 'http://localhost:3333/',
                ws: true
            }
        });
    } catch (err) {
        console.error('Error initializing browser-sync with proxy: ', err);
    }
}
gulp.task('browser-sync-proxy', series(proxyBrowserSync));

// Minimize Your Images
function minimizeImages() {
    try {
        return gulp
            .src('assets/img/**/*')
            .pipe(imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
                })
            ]))
            .pipe(gulp.dest('./public/img'));
    } catch (err) {
        console.error('Error minimizing images: ', err);
    }
}
gulp.task('imagemin', series(minimizeImages));

// Default Gulp task
function defaultTask(cb) {
    const watch = () => {
        gulp.watch('./assets/scss/**/*', gulp.parallel('styles'));
        gulp.watch('./assets/js/**/*', gulp.series('webpack:dev'));
        gulp.watch(['./public/**/*', './public/*']).on('change', browserSync.reload);
    };

    const dev = gulp.series('webpack:dev', 'styles', watch);
    const browserSyncInit = gulp.series(initBrowserSync);

    gulp.task('dev', dev);
    gulp.task('browserSyncInit', browserSyncInit);

    return gulp.parallel('dev', 'browserSyncInit')(cb);
}

gulp.task('default', defaultTask);

// Gulp task when running on a backend like PHP, PYTHON, GO, etc..
function watchProxy() {
  return parallel(
    series(
      'webpack:dev',
      'styles',
      function watch() {
        gulp.watch('./assets/scss/**/*', parallel('styles'));
        gulp.watch('./assets/js/**/*', parallel('webpack:dev'));
        gulp.watch(['./public/**/*', './public/*']).on('change', browserSync.reload);
      }
    ),
    series('browser-sync-proxy')
  ).on('error', function (err) {
    console.error(err.message);
    this.emit('end');
  });
}
gulp.task('watch-proxy', watchProxy);

// Production build for your app
function build() {
  return series(
    parallel('styles', 'webpack:prod')
  ).on('error', function (err) {
    console.error(err.message);
    this.emit('end');
  });
}
gulp.task('build', build);

// Static Site Generator
function views() {
  function buildGulpHtml() {
    try {
      return gulp
        .src([
          'assets/views/**/*.pug',
          '!assets/views/{layouts,layouts/**}',
          '!assets/views/{includes,includes/**}',
        ])
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('./temp'));
    } catch (err) {
      console.error(err.message);
    }
  }
  function cleanUrl() {
    try {
      return gulp
        .src('temp/**/*.html')
        .pipe(prettyUrl())
        .pipe(gulp.dest('public'));
    } catch (err) {
      console.error(err.message);
    }
  }
  return series(buildGulpHtml, cleanUrl);
}
gulp.task('views', views);

// Delete Your Temp Files
function cleanTemp() {
  try {
    return del(['./temp']);
  } catch (err) {
    console.error(err.message);
  }
}
gulp.task('cleanTemp', cleanTemp);

// Tasks to generate site on development this will also have live reload
function staticDev() {
  return parallel(
    series(
      'views',
      'webpack:dev',
      'styles',
      'cleanTemp',
      function watch() {
        // Watch for changes in views
        gulp.watch('./assets/views/**/*', series('views', 'cleanTemp'))
          .on('error', function handleError(error) {
            console.log(error);
            this.emit('end');
          });

        // Watch for changes in styles
        gulp.watch('./assets/scss/**/*', parallel('styles'))
          .on('error', function handleError(error) {
            console.log(error);
            this.emit('end');
          });

        // Watch for changes in JS files
        gulp.watch('./assets/js/**/*', parallel('webpack:dev'))
          .on('error', function handleError(error) {
            console.log(error);
            this.emit('end');
          });

        // Reload the browser when changes are made to the public folder
        gulp.watch(['./public/**/*', './public/*']).on('change', browserSync.reload)
          .on('error', function handleError(error) {
            console.log(error);
            this.emit('end');
          });
      }
    ),
    series('browser-sync')
  )
}
gulp.task('static-dev', staticDev);

// this will run your static site for production
function staticBuild() {
    return series(
        series('views', 'cleanTemp'),
        parallel('styles', 'webpack:prod')
    ).on('error', console.error.bind(console)); // add error handling for all tasks
}
gulp.task('static-build', staticBuild);