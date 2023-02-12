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
const styles = async () => {
  return gulp
    .src('assets/scss/**/*.scss')
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
};

/ Use Webpack to compile latest Javascript to ES5
// Webpack on Development Mode
const webpackDev = async () => {
  try {
    await exec('npm run dev:webpack');
  } catch (err) {
    console.error(err);
  }
};
// Webpack on Production Mode
const webpackProd = async () => {
  try {
    await exec('npm run build:webpack');
  } catch (err) {
    console.error(err);
  }
};

// Browser-sync to get live reload and sync with mobile devices
const browsersync = async () => {
  browserSync.init({
    server: './public',
    notify: false,
    open: false,
    injectChanges: false
  });
};
// Use Browser Sync With Any Type Of Backend
const browserSyncProxy = async () => {
  browserSync.init({
    proxy: {
      target: 'http://localhost:3333/',
      ws: true
    }
  });
};

// Minimise Your Images
const imageMin = () => {
  return gulp
    .src('assets/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox:
          removeViewBox: true
        }, {
          cleanupIDs: false
        }]
      })
    )
    .pipe(gulp.dest('./public/img'));
};

// This is your Default Gulp task
const start = gulp.series(webpackDev, styles, browsersync, () => {
  gulp.watch('./assets/scss/**/*', styles);
  gulp.watch('./assets/js/**/*', webpackDev);
  gulp.watch(['./public/**/*', './public/*']).on('change', reload);
});

// This is the task when running on a backend like PHP, PYTHON, GO, etc..
const watchProxy = gulp.parallel(
  gulp.series(webpackDev, styles, () => {
    gulp.watch('./assets/scss/**/*', styles);
    gulp.watch('./assets/js/**/*', webpackDev);
    gulp.watch(['./public/**/*', './public/*']).on('change', reload);
  }),
  browserSyncProxy
);

// This is the production build for your app
const build = gulp.series(gulp.parallel(styles, webpackProd));

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

const cleanUrls = () => {
  return gulp
    .src('temp/**/*.html')
    .pipe(prettyUrl())
    .pipe(gulp.dest('public'))
    .on('end', () => {
      return;
    });
};

const views = gulp.series(buildTemplate(process.env.TEMPLATE_ENGINE || 'pug'), cleanUrls);

// Delete Your Temp Files
const cleanTemp = async () => {
  return del([
    './temp'
  ]);
};

// Tasks to generate site on development this will also have live reload
const staticDev = gulp.series(
  views,
  webpackDev,
  styles,
  cleanTemp,
  () => {
    gulp.watch('./assets/views/**/*', gulp.series(views, cleanTemp));
    gulp.watch('./assets/scss/**/*', styles);
    gulp.watch('./assets/js/**/*', webpackDev);
    gulp.watch(['./public/**/*', './public/*']).on('change', reload);
  },
  browsersync
);

// this will run your static site for production
const staticBuild = gulp.series(
  gulp.series(views, cleanTemp),
  gulp.parallel([styles, webpackProd])
);
