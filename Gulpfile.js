// Gulpfile.js
// Require the needed packages
var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    clean      = require('gulp-clean'),
    stylus     = require('gulp-stylus'),
    browserify = require('gulp-browserify'),
    rename     = require('gulp-rename'),
    ejs        = require("gulp-ejs"),
    path       = require("path");

if (process.env.ENVIRONMENT != "PRODUCTION") {
  livereload = require('gulp-livereload');
}

var baseAppPath = path.join(__dirname, 'app'),
    baseStaticPath = path.join(__dirname, '.generated'),
    baseJsPath = path.join(baseAppPath, 'js'),
    baseCssPath = path.join(baseAppPath, 'css');

var paths = {
  cssPath: [
    path.join(baseCssPath, '**', '*.styl*'),
    baseCssPath, path.join('**', '*', '*.styl*')
  ],
  cssInput: path.join(baseCssPath, 'main.styl'),
  cssOutput: path.join(baseStaticPath, 'css'),
  coffeePath: [path.join(baseJsPath, '**', '*.coffee')],
  coffeeInput: path.join(baseJsPath, 'bash.coffee'),
  coffeeOutput: path.join(baseStaticPath, 'js'),
  ejsPath:  [
    path.join(baseAppPath, '**', '*.ejs')
  ],
  assetsBasePath: baseAppPath,
  assetsPaths: [
    path.join(baseAppPath, 'img', '**', '*'),
    path.join(baseAppPath, 'fonts', '**', '*'),
    path.join(baseAppPath, '**', '*.html')
  ],
  assetsOutput: baseStaticPath
};

var testFiles = [
  '.generated/js/app.js',
  'test/client/*.js'
];


gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});


//
// Stylus
//


// Get and render all .styl files recursively
gulp.task('stylus', function () {
  gulp.src(paths.cssInput)
    .pipe(stylus()
      .on('error', gutil.log)
      .on('error', gutil.beep))
    .pipe(gulp.dest(paths.cssOutput));
});


//
// Coffee
//

gulp.task('coffee', function() {
  gulp.src(paths.coffeeInput, { read: false })
    .pipe(browserify({
      basedir: __dirname,
      transform: ['coffeeify'],
      extensions: ['.coffee']
    })
      .on('error', gutil.log)
      .on('error', gutil.beep))
    .pipe(rename('bash.js'))
    .pipe(gulp.dest(paths.coffeeOutput))

  gulp.src(path.join(__dirname, 'app', 'js', 'app.coffee'), { read: false })
    .pipe(browserify({
      transform: ['coffeeify'],
      extensions: ['.coffee']
    }).on('error', gutil.log).on('error', gutil.beep))
    .pipe(rename('app.js'))
    .pipe(gulp.dest(paths.coffeeOutput))
});


//
// EJS
//

gulp.task('ejs', function() {
  gulp.src(paths.ejsPath)
    .pipe(ejs()
      .on('error', gutil.log)
      .on('error', gutil.beep))
    .pipe(gulp.dest(paths.assetsOutput));
});

//
// Static Assets
//

gulp.task('assets', function() {
  gulp.src(paths.assetsPaths, {base: paths.assetsBasePath})
    .on('error', gutil.log)
    .on('error', gutil.beep)
    .pipe(gulp.dest(paths.assetsOutput));
});


//
// Clean
//

gulp.task('clean', function() {
  gulp.src(path.join(baseStaticPath, '**', '*'), {read: false})
    .pipe(clean());
});


//
// Watch
//
gulp.task('watch', ['clean','stylus','coffee','assets','ejs'], function() {
  gulp.watch(paths.cssPath, ['stylus']);
  gulp.watch(paths.coffeePath, ['coffee']);
  gulp.watch(paths.assetsPaths, ['assets']);
  gulp.watch(paths.ejsPath, ['ejs']);
  if (livereload) {
    var server = livereload();
    gulp.watch(path.join(baseStaticPath, '**')).on('change', function(file) {
      server.changed(file.path);
    });
  }
});

gulp.task('default', ['stylus', 'coffee', 'assets', 'ejs']);
