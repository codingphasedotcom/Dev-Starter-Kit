import path from 'path';
import gulp from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import { exec } from 'child_process';
import pug from 'gulp-pug';
import imagemin from 'gulp-imagemin';
import prettyUrl from 'gulp-pretty-url';
import del from 'del';
import webpack from 'webpack';

// Destructure parallel and series functions from gulp
const { parallel, series, watch, src, dest } = gulp;

// Reloading site when changes occur
const reload = browserSync.reload;

// Set the "sass" option to use "sass" package
const { options } = sass(sassCompiler);

// Compile SCSS files to CSS
function compileStyles() {
  return src('./assets/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(dest('./public/css'))
    .pipe(reload({ stream: true }));
}

export default compileStyles;

// Use Webpack to compile latest JavaScript to ES5
// Webpack on Development Mode
export function runWebpackDev(cb) {
  webpack({
    mode: 'development',
    entry: './assets/js/main.js',
    output: {
      path: path.join(new URL('./public/js/', import.meta.url).pathname),
      filename: 'main.min.js',
    },
    // ...
  }, function (err, stats) {
    if (err) {
      console.log(`Error in webpack:dev task: ${err.message}`);
    } else {
      console.log(stats.toString({
        chunks: false,
        colors: true,
      }));
    }
    cb(err);
  });
}
//export { runWebpackDev }

// Webpack on Production Mode
export function runWebpackProd(cb) {
  const outputPath = fileURLToPath(new URL('./public/js', import.meta.url));

  webpack({
    mode: 'production',
    entry: './assets/js/main.js',
    output: {
      path: outputPath,
      filename: 'main.min.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  }, function (err, stats) {
    if (err) {
      console.log(`Error in webpack:prod task: ${err.message}`);
    } else {
      console.log(stats.toString({
        chunks: false,
        colors: true,
      }));
    }
    cb(err);
  });
}
//export { runWebpackProd }

// Use Browser Sync With Any Type Of Backend
export function initBrowserSync() {
  try {
    browserSync.init({
      server: {
        baseDir: './public',
      },
      notify: true,
      open: false,
      reloadDelay: 300,
    });
  } catch (err) {
    console.error('Error initializing browser-sync with server: ', err);
  }
}

// Minimize your images
export function minimizeImages() {
  try {
    return gulp
      .src('assets/img/**/*')
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] }),
        ])
      )
      .pipe(gulp.dest('./public/img'));
  } catch (err) {
    console.error('Error minimizing images: ', err);
  }
}

// Default Gulp task
export function defaultTask(cb) {
  // Watch for changes and recompile assets on the fly
  const watchTask = () => {
    watch('./assets/scss/**/*', compileStyles);
    watch('./assets/js/**/*', series(runWebpackDev));
    watch(['./public/**/*', './public/*'], browserSync.reload);
  };

  // Define development tasks
  const dev = series(runWebpackDev, compileStyles, watchTask);
  const browserSyncInit = series(initBrowserSync);

  // Run the tasks in parallel
  return parallel(dev, browserSyncInit)(cb);
}

// Watch for changes and recompile assets on the fly when running on a backend like PHP, PYTHON, GO, etc..
export function watchProxy() {
  // Define a function to watch for changes and recompile assets
  const watchTask = () => {
    watch('./assets/scss/**/*', compileStyles);
    watch('./assets/js/**/*', parallel(runWebpackDev));
    watch(['./public/**/*', './public/*'], browserSync.reload);
  };

  // Define the development tasks to be run in parallel
  const dev = series('webpack:dev', compileStyles, watchTask);
  const browserSyncProxy = series('browser-sync-proxy');

  // Run the tasks in parallel
  return parallel(dev, browserSyncProxy);
}

// Build production-ready assets for your app
function build() {
  return series(compileStyles, runWebpackProd);
}

// Convert Pug templates to HTML files
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

// Clean up URLs in HTML files
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

// Export the "views" task to compile Pug templates to HTML and clean up URLs
export const views = series(buildGulpHtml, cleanUrl);

// Delete temporary files
function cleanTemp() {
  try {
    return del(['./temp']);
  } catch (err) {
    console.error(err.message);
  }
}

// Export the "cleanTempTask" task to delete temporary files
export const cleanTempTask = cleanTemp;

// Tasks to generate site on development with live reload
function staticDev(cb) {
  function watch() {
    // Watch for changes in views
    gulp.watch('./assets/views/**/*', series('views', 'cleanTemp'))
      .on('error', function handleError(error) {
        console.log(error);
        this.emit('end');
      });

    // Watch for changes in styles
    gulp.watch('./assets/scss/**/*', parallel(compileStyles))
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
  };

  const dev = series('views', 'webpack:dev', compileStyles, 'cleanTemp');
  const browserSyncInit = series(initBrowserSync, watch);

  // Export the tasks
  const staticDevTask = parallel(dev, browserSyncInit);
  staticDevTask.displayName = 'staticDev';

  return staticDevTask(cb);
};

// This will run your static site for production
const staticBuild = series(views, cleanTemp, parallel(compileStyles, runWebpackProd));
staticBuild.displayName = 'staticBuild';

export { staticDev, staticBuild };
