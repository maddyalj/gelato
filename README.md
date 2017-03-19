# Gelato
*Project Template Toolkit*

Gelato is a command line tool that allows developers to efficiently generate their project files using template files. It supports all typical programming features and allows outputting multiple files from single template.

## File Structure
```
.
├── bin
├── demo
├── lib
├── test
│   ├── e2e
│   └── unit
└── test-files
```
* `.` contains `main.js` (`Main` module), `package.json` (project metadata), `yarn.lock` (project dependencies)
* `bin` contains cli Node.js script that handles `gelato` cli command
* `demo` contains demo files for you to try Gelato easily
* `lib` contains submodules that Gelato is made of (`Tokenizer`, `Parser`, `Evaluator`)
* `test` contains `e2e` (end-to-end) and `unit` test cases
* `test-files` contains test files required for e2e and unit tests to work (**PLEASE DO NOT ALTER TO NOT BREAK TESTS**)

## Before Usage
1. Make sure you have Node.js v7.4.0 and Yarn v0.19.1 installed (other versions will probably work, but if something does not work please install the same versions as mine). Installation instructions could be found here:
    * Node.js: https://nodejs.org
        * This is the runtime environment used to run Javascript applications like Gelato in your machine.
    * Yarn: https://yarnpkg.com
        * This is a package dependency manger for Node.js that will allow you to install Gelato's dependencies easily
2. After cloning Gelato, `cd` into the cloned directory
3. Run `yarn`. This will install all dependencies mentioned in `yarn.lock`
4. Run `yarn link`. This will link the `gelato` cli command to your terminal

Now you're ready to go!

### Running Tests
Run `yarn test` to execute all unit and end-to-end tests. The results will be outputted for you in detail.

## Configuration
In your project folder, such as `demo`, you are able to pass your options and context into Gelato using a config file. By default Gelato will look for a file in the root of your project called `gelatorc.js`. You can find one for example in `demo/gelatorc.js`. This is a simple javascript file the exports a javascript object file with the options that it wants to pass into Gelato.

In the cli, you can override these options by supplying flags with your `gelato` command. You can view a list of all avaialable options by running `gelato -h`.

### Possible Options
Here is a list of all options you're able to provide for Gelato.

Parameter | Override with CLI | Description | Default
--- | --- | --- | ---
src | Pass as arguments [src] | Source file glob patterns | '\*\*/[^\_]\*.gel'
config | Use flag --config \<file> or shorthand -c \<file> | Config file | 'gelatorc.js'
dest | Use flag --dest \<directory> or shorthand -d \<directory> | Destination directory | 'build'
context | Use flag --context \<object> or shorthand -C \<object> | Context object | {}
repeat | Use flag --repeat \<object> or shorthand -C \<object> | Repeat object | {}
expressionStartTag | Use flag --expression-start-tag \<tag> | Start tag for expression statements | '[['
expressionEndTag | Use flag --expression-end-tag \<tag> | End tag for expression statements | ']]'
controlStartTag | Use flag --control-start-tag \<tag> | Start tag for control statements | '[!'
controlEndTag | Use flag --control-end-tag \<tag> | End tag for control statements | '!]'
includeStartTag | Use flag --include-start-tag \<tag> | Start tag for include statements | '[@'
includeEndTag | Use flag --include-end-tag \<tag> | End tag for include statements | '@]'
