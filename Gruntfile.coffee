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

    mochaTest:
      test:
        options:
          reporter: 'spec'
          require: 'coffee-script'
        src: ['<%= config.test %>/{,*/}{,*/}{,*/}{,*/}*.coffee']


  grunt.registerTask "dev", [
    "express:dev",
    "watch:dev"
  ]

  grunt.registerTask "build", [
    "jshint"
    "mochaTest"
  ]

  grunt.registerTask "test", [
    'mochaTest'
  ]

