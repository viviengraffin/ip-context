# How to contribute?

## As a developer

As a developer, you must first install Deno on your computer.

The command to use to install Deno is located [here](https://deno.com)

Once Deno is installed, you must clone the dev branch of this repository : 

```sh
git clone -b dev https://github.com/viviengraffin/ip-context.git
```

After that, you must type this command in the project directory:

```sh
deno install
```

You will have access to the following commands:

- deno task bench : Runs a performance test
- deno task test : Runs the unit tests
- deno task test:watch : Executes unit tests during development
- deno task build : Build versions for web and npm
- deno task build:web : Build web versions
- deno task build:npm : Build npm version

From here, you can contribute to the development of this library.
