module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach (contrib) ->
    grunt.loadNpmTasks contrib

  config =
    src: 'src'
    test: 'test'

  grunt.initConfig
    config: config

    jshint:
      options:
        jshintrc: ".jshintrc"

      all: [
        "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}*.js"
      ]

    express:
      dev:
        options:
          script: "<%= config.src %>/start-app.js"

    watch:
      dev:
        files: [
          "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}*.js"
        ]
        tasks: ["express"]
        options:
          livereload: true
          nospawn: true # Without this option specified express won't be reloaded
      test:
        files: [
          "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}*.js"
          "<%= config.test %>/{,*/}{,*/}{,*/}{,*/}*.js"
        ]
        tasks: ["mochaTest"]


    mochaTest:
      test:
        options:
          ui: 'exports'
          reporter: 'spec'
          require: 'coffee-script'
        src: ['<%= config.test %>/{,*/}{,*/}{,*/}{,*/}*.test.js']


  grunt.registerTask "dev", [
    "express:dev",
    "watch:dev"
  ]

  grunt.registerTask "test", [ 
    "mochaTest" 
  ]

  grunt.registerTask "build", [
    "jshint"
    "mochaTest"
    "docs"
  ]

  
