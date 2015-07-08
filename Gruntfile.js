module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // 定义一个用于插入合并输出文件之间的字符
        separator: ';'
      },
      dist: {
        // 将要被合并的文件
        src: ['view/framework/angular.js', 'view/framework/angular-sanitize.js', 'view/js/*.js'],
        // 合并后的JS文件的存放位置
        dest: 'view/build/release.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'view/build/release.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    watch: {
      files: ['view/**/*.js'],
      tasks: ['concat','uglify']
    }
  });

  // 加载包含 "uglify" 任务的插件。
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['concat','uglify','watch']);

};