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
