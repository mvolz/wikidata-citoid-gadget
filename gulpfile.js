const gulp = require('gulp');
const jshint = require('gulp-jshint');
const notify = require('gulp-notify');
const concat = require('gulp-concat');

gulp.task('jshint', function() {
	return gulp.src('src/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(notify({
			title: 'JSHint',
			message: 'JSHint passed'
		}))
});

gulp.task('concat', function() {
	return gulp.src('./src/*.js')
		.pipe(concat('CiteTool.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', gulp.series('jshint', 'concat'));
