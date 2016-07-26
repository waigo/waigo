# Using the CLI

In the [Getting Started](#getting-started) section you used the Waigo command-line interface (CLI) to get a 
working application up and running. 

Even if you install Waigo globally in order to use the CLI, it's smart enough to delegate control to your local 
installation of Waigo (in your `node_modules` folder) if one is present.

The available CLI commands can be seen by typing:

```bash
$ waigo --help

  Usage: waigo [options] [command]

  Commands:

    init-gulp   Initialise and create a skeleton Gulpfile and associated tasks
    init        Initialise and create a skeleton Waigo app

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
``` 

Further help is available for each command. For example to find out what 
arguments are possible for the `init` command (which we used in the 
[Hello World](#hello-world) example earlier):

```bash
$ waigo init --help

  Usage: init [options]

  Options:

    -h, --help             output usage information
    ...
```

The `<waigo npm folder>/src/cli/data` folder contains 
any data to be used the CLI commands (e.g. script templates) and does not get 
scanned by the Waigo [module loader](#module-loader). 


