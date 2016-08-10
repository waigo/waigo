# Using the CLI

In the earlier Hello World example you used the Waigo command-line interface (CLI) to get a 
working application up and running. 

Even if you install Waigo globally in order to use the CLI it's smart enough to delegate control to the local 
installation of Waigo in your `node_modules` folder, if one is present.

The available CLI commands can be seen by typing:

```bash
$ waigo --help

  Usage: waigo [options] [command]


  Commands:

    init        Initialise and create a skeleton Waigo app
    init-gulp   Initialise and create a Gulpfile and associated tasks for development purposes

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
``` 

Further help is available for each command. For example, to find out what 
arguments are possible for the `init` command:

```bash
$ waigo init --help

  Usage: init [options]

  Initialise and create a skeleton Waigo app

  Options:

    -h, --help  output usage information
```

The `<waigo npm folder>/src/cli/data` folder contains 
any data files to be used by CLI commands (e.g. script templates) and does not get 
scanned by the Waigo module loader.


