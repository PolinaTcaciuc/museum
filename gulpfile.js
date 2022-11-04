const {
	src,
	dest,
	watch,
	parallel,
	series
} = require('gulp');
const include = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const ttf2woff2 = require('gulp-ttf2woff2');
const webpack = require('webpack');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const webpackStream = require('webpack-stream');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));

/* ------------------- clean dist ------------------- */

function cleanDist() {
	return del('dist')
}

/* ------------------- scss styles ------------------- */

const styles = () => {
	return src('./src/assets/style/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(scss({
			outputStyle: 'compressed'
		}))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./dist/assets/style'))
		.pipe(browserSync.stream());
}

/* ------------------- html include ------------------- */

const htmlInclude = () => {
	return src(['./src/**.html'])
		.pipe(include({
			prefix: '@@',
			// basepath: '@file'
		}))
		.pipe(htmlmin({
			collapseWhitespace: true,
		}))
		.pipe(dest('./dist'))
		.pipe(browserSync.stream());
}


/* ------------------- images DEV ------------------- */

const imgagesDev = () => {
	return src(['./src/assets/images/static/**/*'])
		.pipe(dest('./dist/assets/images'))
		.pipe(browserSync.stream());
}

/* ------------------- images PROD ------------------- */

function imagesCompress() {
	return src('dist/assets/images/*/**')
		.pipe(imagemin([
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.mozjpeg({
				quality: 75,
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
						removeViewBox: true
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest('dist/images'))
}

/* ------------------- svg sprites ------------------- */
const svgSprites = () => {
	return src('./src/assets/images/icons/**/*.svg', )
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg"
				}
			}
		}))
		.pipe(dest('./dist/assets/images/sprite'))
		.pipe(browserSync.stream());
}

/* ------------------- fonts (ttf ---> woff2) ------------------- */
const fonts = () => {
	return src('./src/assets/fonts/**.ttf')
		.pipe(ttf2woff2())
		.pipe(dest('./dist/assets/fonts'))
		.pipe(browserSync.stream());
}
/* ------------------- iconsfonts ------------------- */

// const iconsfonts = () => {
// 	return src('./src/assets/fonts/iconsfonts/**/*')
// 		.pipe(dest('./dist/assets/fonts'))
// 		.pipe(browserSync.stream());
// }


/* ------------------- scripts DEV------------------- */

const scripts = () => {
	return src('./src/assets/js/**/*.js')
		.pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
		}))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./dist/assets/js'))
		.pipe(browserSync.stream());
}
/* ------------------- scripts PROD------------------- */

const scriptsBuild = () => {
	return src('./src/js/script.js')
		.pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
		}))
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end');
		})
		.pipe(uglify().on("error", notify.onError()))
		.pipe(dest('./dist/js'))
}


/* ------------------- watching------------------- */

const watching = () => {
	browserSync.init({
		baseDir: "./",
		server: "./dist"

	});
	watch('./src/assets/style/**/*.scss', styles);
	watch('./src/**/*.html', htmlInclude);
	watch('./src/assets/images/**/*.jpg', imgagesDev);
	watch('./src/assets/images/**/*.png', imgagesDev);
	watch('./src/assets/images/**/*.jpeg', imgagesDev);
	watch('./src/assets/fonts/**.ttf', fonts);
	watch('./src/assets/js/**/*.js', scripts);
	watch('./src/assets/images/**/*.svg', svgSprites);
}


exports.styles = styles;
exports.watching = watching;
exports.default = series(cleanDist, htmlInclude, fonts, styles, imgagesDev, svgSprites, htmlInclude, scripts, watching);
// exports.build = series(cleanDist, parallel(htmlInclude, html,scriptsBuild, fonts, imgagesDev), styles, imagesCompress);