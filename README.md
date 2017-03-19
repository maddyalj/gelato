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
Run `yarn test` to execute all unit and end-to-end tests. The results will be outputted for you in details.
