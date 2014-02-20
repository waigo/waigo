module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach (contrib) ->
    grunt.loadNpmTasks contrib

  config =
    src: 'src'
    test: 'test'
    api_docs: 'api'

  grunt.initConfig
    config: config

    jshint:
      options:
        jshintrc: ".jshintrc"

      all: [
        "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.js"
      ]

    watch:
      api_docs:
        files: [
          "<%= config.src %>/{,*/}{,*/}{,*/}{,*/}*.js"
        ]
        tasks: ["api_docs"]
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
      api_docs:
        command: 'node_modules/.bin/doxx --source <%= config.src %> --target <%= config.api_docs %>'


  grunt.registerTask "test", [ 
    "mochaTest" 
  ]

  grunt.registerTask "docs", [ 
    "shell:api_docs" 
  ]

  grunt.registerTask "build", [
    "jshint"
    "mochaTest"
    "docs"
  ]

  grunt.registerTask "default", ["build"]
  
