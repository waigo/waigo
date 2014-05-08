module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach (contrib) ->
    grunt.loadNpmTasks contrib

  config =
    src: 'src'
    test: 'test'
    api_docs: 'docs/api'

  grunt.initConfig
    config: config

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
        src: [
          '<%= config.test %>/unit/index.test.js'
          '<%= config.test %>/unit/loader.test.js'
          '<%= config.test %>/unit/src/{,*/}{,*/}{,*/}{,*/}{,*/}{,*/}*.test.js'
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
      api_docs:
        command: 'node_modules/.bin/doxx --ignore nothingToIgnore --source <%= config.src %> --target <%= config.api_docs %>'



  grunt.registerTask "jshint", [ 
    "shell:jshint" 
  ]

  grunt.registerTask "docs", [ 
    "shell:api_docs" 
  ]

  grunt.registerTask "test", [ 
    "jshint",
    "mochaTest" 
  ]

  grunt.registerTask "build", [
    "test"
    "docs"
  ]

  grunt.registerTask "default", ["build"]
  
