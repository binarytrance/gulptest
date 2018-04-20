var autoprefixer       = require('gulp-autoprefixer');
var beeper             = require('beeper');
var browserSync        = require('browser-sync');
var cache              = require('gulp-cache');
var cleanCSS           = require('gulp-clean-css');
var gconcat            = require('gulp-concat');
var gulp               = require('gulp');
var gutil              = require('gulp-util');
var imagemin           = require('gulp-imagemin');
var notify             = require('gulp-notify');
var plumber            = require('gulp-plumber');
var pug                = require('gulp-pug');
var rename             = require("gulp-rename");
var sass               = require('gulp-sass');
var sourcemaps         = require('gulp-sourcemaps');
var uglify             = require('gulp-uglify');
var babel              = require('gulp-babel');
// var uncss              = require('gulp-uncss');
var postcss            = require('gulp-postcss');
var uncss              = require('postcss-uncss');
var csslint            = require('gulp-csslint');
var sassLint 		   = require('gulp-sass-lint');
var jshint             = require('gulp-jshint');
// sudo npm install gulp-uglify browser-sync gulp-plumber gulp-autoprefixer gulp-sass gulp-pug gulp-imagemin gulp-cache gulp-clean-css gulp-sourcemaps gulp-concat beeper gulp-util gulp-rename gulp-notify --save-dev
var jsVendorFiles      = ['js/vendor/*.js'];             // Holds the js vendor files to be concatenated
var myJsFiles          = ['js/*.js'];    // Holds the js files to be concatenated
var fs                 = require('fs');  // ExistsSync var to check if font directory patch exist
var onError            = function(err) { // Custom error msg with beep sound and text color
		notify.onError({
			title:    "Gulp error in " + err.plugin,
			message:  err.toString()
		})(err);
		beeper(3);
		this.emit('end');
		gutil.log(gutil.colors.red(err));
};


gulp.task('styles', function() {
	var plugins = [
        uncss({
         ignore: [
             /.js/
             ],
           html: ['build/**/*.html', 'build/**/*.js'],

       }),
    ];
	gulp.src('styles/*.scss')
	.pipe(plumber({ errorHandler: onError }))
	.pipe(sourcemaps.init())
	.pipe(sass({indentedSyntax: true}))
	.pipe(autoprefixer({
		browsers: ['last 5 versions'],
		cascade: false}))
	.pipe(cleanCSS())
	.pipe(postcss(plugins))
	.pipe(sourcemaps.write())
	.pipe(rename({ suffix: '.min'}))
	.pipe(gulp.dest('build/css'));
});

gulp.task('sass-lint', function () {
    return gulp.src([
        'styles/**/*.scss',
    ])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});

gulp.task('templates', function() {
	gulp.src('./*.pug')
	.pipe(plumber({ errorHandler: onError }))
	.pipe(pug())
	.pipe(gulp.dest('build/'));
});

gulp.task('scripts', function() {
	return gulp.src(myJsFiles.concat(jsVendorFiles))
	.pipe(plumber({ errorHandler: onError }))
	.pipe(sourcemaps.init())
	.pipe(babel({presets: ['env']}))
	// .pipe(jshint())
	// .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
	.pipe(gconcat('main.js'))
	.pipe(uglify())
	.pipe(sourcemaps.write())
	.pipe(rename({ suffix: '.min'}))
	.pipe(gulp.dest('build/js'));
});

// Task: JSHint
gulp.task('js-lint', function() {
  gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('images', function() {
	gulp.src('img/**/*')
	.pipe(cache(imagemin({
		optimizationLevel: 3,
		progressive: true,
		interlaced: true})))
	.pipe(gulp.dest('build/img/'));
});



gulp.task('watch', function() {
	gulp.watch('styles/**/*.scss',                        ['styles']);
	gulp.watch('styles/**/*.scss',                        ['sass-lint'])
	gulp.watch(['templates/**/*.pug', './*.pug'],         ['templates']);
	gulp.watch('js/**/*.js',                              ['scripts']);
	gulp.watch('js/**/*.js',                              ['js-lint']);
	gulp.watch('img/**/*',                                ['images']);

// init server
	browserSync.init({
		server: {
			proxy: "local.build",
			baseDir: "build/"
		}
	});

	gulp.watch(['build/**'], browserSync.reload);
});

// https://www.npmjs.com/package/gulp-csslint
// https://github.com/CSSLint/csslint/wiki/Rules-by-ID
// https://www.npmjs.com/package/gulp-jshint
// https://www.npmjs.com/package/gulp-sass-lint
// https://github.com/sasstools/sass-lint/blob/master/docs/sass-lint.yml
// https://www.evoketechnologies.com/blog/code-review-checklist-perform-effective-code-reviews/
// code review dev.to
// https://frontendchecklist.io/
// css lint?? 
// https://css-tricks.com/prettier-stylelint-writing-clean-css-keeping-clean-code-two-tool-game/