module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach (contrib) ->
    grunt.loadNpmTasks contrib

  config =
    src: 'src'
    test: 'test'

  grunt.initConfig
    config: config

    watch:
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
        src: [
          '<%= config.test %>/unit/index.test.js'
          '<%= config.test %>/unit/loader.test.js'
          '<%= config.test %>/unit/src/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.test.js'
          '<%= config.test %>/unit/src/support/cliCommand.test.js'
        ]

    shell:
      options:
        stdout: true
        stderr: true
        failOnError: true
      jshint:
        command: [
          'node_modules/.bin/jshint --config .jshintrc'
          '<%= config.src %>/routes.js'
          '<%= config.src %>/**/*.js'
          '<%= config.src %>/**/**/*.js' 
          '<%= config.src %>/**/**/**/*.js' 
        ].join(' ')



  grunt.registerTask "jshint", [ 
    "shell:jshint" 
  ]

  grunt.registerTask "test", [ 
    "jshint",
    "mochaTest" 
  ]

  grunt.registerTask "build", [
    "test"
  ]

  grunt.registerTask "default", ["build"]
  
