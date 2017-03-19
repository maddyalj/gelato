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

## Usage Examples

### Basic
In this example, our aim is to create a simple text file that says `Hello Sarah!`. The name Sarah will be passed separately into the template.
1. Create an empty project directory called `gelato-example`
2. `cd gelato-example`
3. Create a new file called `user.txt.gel` and write the following code:
    ```
    Hello [[ name ]]!
    ```
    * Gelato template files end with `.gel` extension. After running gelato, this extension will be removed, hence getting a file called `user.txt`
    * Gelato can work with any programming language (or plain files like this one
    * This file has an expression. Expressions are passed to Gelato by wrapping them like this `[[ EXPRESSION_HERE ]]`
    * Any valid Javascript code could be put as an expression and its evaluated value will be written to the output file.
    * In this case, `name` is a variable that should be defined in the context object passed to Gelato using `gelatorc.js` file that we're creating next
4. Create the configuration file `gelatorc.js` and write the following code:
    ```javascript
    const context = {
        name: 'Sarah',
    }

    module.exports = { context }
    ```
5. Run `gelato`. It will look for all `.gel` files that do NOT start with an `_` and process them. It will then create a `build` directory and add the outputted files to it. In this case, you'll find the file `user.txt` with the following content:
    ```
    Hello Sarah!
    ```

### Multiple Output
In this example, we'll supply Gelato context with an array of `names`, and we want it to output a file for each of these names.
1. Change `context` variable value in `gelatorc.js` into the following:
    ```javascript
    const context = {
        names: ['Sarah', 'Mark', 'Liam', 'Emily', 'Jack'],
    }
    ```
2. Define a `repeat` variable to instruct Gelato to output a file for each `name` in the `names` array. This is how the whole `gelatorc.js` file should look like:
    ```javascript
    const context = {
        names: ['Sarah', 'Mark', 'Liam', 'Emily', 'Jack'],
    }

    const repeat = {
        'user.text.gel': {
            variable: 'name',
            array: 'names',
            filename: '[[ name ]].txt.gel',
        },
    }

    module.exports = { context, repeat }
    ```
    * Since we're only supplying one filename we need to give Gelato the pattern to follow for naming each output file, by pretending the input filename to be in the format of `[[ name ]].txt.gel`. This will produce something like `Sarah.txt`, `Mark.txt` ...etc
3. It's time to run `gelato` command. Now you should get 5 new files in your `build` directory. Each one is named after one of the names in the `names` array

### Demo Files
Gelato has a variety of more complex features such as loops and if statements. Detailed usage instructions are written in the Template Syntax section of this document. However, I've written many complicated template files for a variety of programming languages in the `demo` directory.

The `demo` directory is basically an example project directory that an end user could have written for writing SQL statements and model files in an MVC web framework. If you like to try it out, simply `cd demo`, and run `gelato` command. As usual, the outputted files will be added to the `build` directory.

## Configuration
In your project folder, such as `demo`, you are able to pass your options and context into Gelato using a config file. By default Gelato will look for a file in the root of your project called `gelatorc.js`. You can find one for example in `demo/gelatorc.js`. This is a simple javascript file the exports a javascript object file with the options that it wants to pass into Gelato.

In the cli, you can override these options by supplying flags with your `gelato` command. You can view a list of all avaialable options by running `gelato -h`.

### Possible Options
Here is a list of all options you're able to provide for Gelato.

Parameter | Override with CLI | Description | Default
--- | --- | --- | ---
src | Pass as arguments [src] | Source file glob patterns | '\*\*/[\^\_]\*.gel'
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
