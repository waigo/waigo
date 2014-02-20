module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach (contrib) ->
    grunt.loadNpmTasks contrib

  config =
    src: 'src'
    test: 'test'
    docs: 'docs'

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
      docs:
        files: [
          "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}*.js"
        ]
        tasks: ["docs"]
      test:
        files: [
          "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.js"
          "<%= config.test %>/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.js"
        ]
        tasks: ["mochaTest"]


    mochaTest:
      test:
        options:
          ui: 'exports'
          reporter: 'spec'
          require: 'coffee-script'
        src: ['<%= config.test %>/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.test.js']

    shell:
      options:
        stdout: true
        stderr: true
        failOnError: true
      doxx:
        command: 'node_modules/.bin/doxx --source <%= config.src %> --target <%= config.docs %>'


  grunt.registerTask "dev", [
    "express:dev",
    "watch:dev"
  ]

  grunt.registerTask "test", [ 
    "mochaTest" 
  ]

  grunt.registerTask "docs", [ 
    "shell:doxx" 
  ]

  grunt.registerTask "build", [
    "jshint"
    "mochaTest"
    "docs"
  ]

  grunt.registerTask "default", ["build"]
  
