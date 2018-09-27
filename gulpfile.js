'use strict' ;

var gulp = require('gulp') ;
var clean = require('gulp-clean') ;
var less = require('gulp-less') ;
var uglify = require('gulp-uglify') ;
var concat = require('gulp-concat') ;
var jshint = require('gulp-jshint') ;
var rename = require('gulp-rename') ;
var plumber = require('gulp-plumber') ;
var minifyCss = require("gulp-minify-css") ;
var gulpSequence = require('gulp-sequence') ;
var gulpif = require("gulp-if") ;
var addsrc = require('gulp-add-src') ;
var os = require('os') ;
var isProd = gulp.env.env === 'prod' ;
var babel = require('gulp-babel') ;
var sourcemaps = require('gulp-sourcemaps') ;
var path = require('path') ;
var fs = require('fs') ;
console.log(gulp.env) ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
需要编译到css目录下对应目录的less文件路径定义
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
var pathLess = [
    "less/app.less" ,
    "less/ios.less" ,
    "less/android.less" ,
    "less/*/*/*.less" ,
    "less/*/*.less" ,
    "!less/components/*.less" ,
    "!less/mixins/*.less" ,
    "!less/variables/*.less"
] ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义对less编译的任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("less", function() {
    return gulp.src(pathLess)
        .pipe(less())
        .pipe(minifyCss())
        .pipe(rename({
            suffix : ".min"
        }))
        .pipe(gulp.dest('css')) ;
});
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
需要编译到js目录下对应目录的jssrc目录源文件路径定义
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
var pathJs = [
    'jssrc/*/*/*.js',
    'jssrc/*/*.js',
    '!jssrc/lib/*.js'    
] ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
对需要合并到app.js的脚本文件路径的定义
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
var pathAppJs = [
    "jssrc/lib/*.js" ,
    "!jssrc/lib/controller.js" ,
    "!jssrc/lib/localCache.js"
] ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义清空编译目录(css | js)任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task('clean', function() {
    return gulp.src([
            'css',
            'js'
        ], {
            read: false
        })
        .pipe(clean()) ;
}) ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义对核心js合并的任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task('js-app', function() {
    return gulp.src([ 'jssrc/lib/controller.js' , 'jssrc/lib/localCache.js' ])
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        })) 
        .pipe(addsrc.prepend(pathAppJs))
        //.pipe(sourcemaps.write('.'))
        .pipe(concat('app.min.js'))
        .pipe(gulpif(isProd, uglify()))
        .pipe(gulp.dest('js')) ;
}) ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义对jssrc目录脚本的编译任务
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task('js', function() {
    return gulp.src(pathJs)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulpif(isProd, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('js')) ;
}) ;
/*-----------------------------------------------------------------------------------------------------------
定义watch任务
-----------------------------------------------------------------------------------------------------------*/
gulp.task('watch', function() {
    gulp.watch('less/**/**/**.less',['less']);
    gulp.watch(['jssrc/lib/*.js'],['js-app']);
    gulp.watch(pathJs,['build']);
});

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义复合任务方便gulp命令一步执行，包括：
1. 清空编译目录
2. 编译less
3. 合并压缩相应文件到app.min.js
4. 编译脚本

gulp build --env=prod 将会压缩合并的脚本文件
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task('default', ['watch']);
//gulp.task('build', gulpSequence('clean', 'less', 'js-controller', 'js-app', 'js'))
gulp.task('build',function(callback){
    gulpSequence('clean', 'less', 'js-app', 'js')(callback) ;
}) ;