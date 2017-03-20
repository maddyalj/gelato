const vm = require('vm')
const fs = require('fs-extra')
const globby = require('globby')

const Tokenizer = require('./lib/tokenizer')
const Parser    = require('./lib/parser')
const Evaluator = require('./lib/evaluator')

const Gelato = {}

/**
 * Run Gelato on a string
 * @param  {string}   input                  input template string
 * @param  {object}   [options={context:{}}] Gelato config options
 * @param  {function} [cb=()=>{}]            function to call once Tokenizer is done
 * @return {string}                          outputted string
 */
Gelato.runOnString = (input, options = { context: {} }, cb = () => {}) => {
    return Tokenizer(input, options, '', tokens => {
        cb(Evaluator(Parser(tokens), options.context))
    })
}

/**
 * Run Gelato using given options
 * @param {object} [options={}] Gelato config options
 */
Gelato.run = (options = {}) => {
    // welcome user to Gelato
    console.log()
    console.log('Welcome to Gelato! 👋')
    console.log()

    // set default config options if not provided by user
    options = Object.assign({
        src: '**/[^_]*.gel',
        dest: 'build',
        context: {},
        repeat: {},
        expressionStartTag: '[[',
        expressionEndTag: ']]',
        controlStartTag: '[!',
        controlEndTag: '!]',
        includeStartTag: '[@',
        includeEndTag: '@]',
    }, options)

    // use src option glob pattern to get list of template filenames
    globby(options.src).then(paths => {
        paths.forEach(inputFile => {
            console.log(` 👓  Reading ${inputFile}`)
            // read each template file
            fs.readFile(inputFile, 'utf8', (err, inputData) => {
                if (err) throw err
                // run Tokenizer on template file content
                Tokenizer(inputData, options, inputFile, tokens => {
                    // produce AST from tokens with Parser
                    const tree = Parser(tokens)
                    // output to file (or multiple files if template file is in the repeat option)
                    if (options.repeat[inputFile]) {
                        repeatOutput(tree, options, inputFile)
                    } else {
                        evaluateToFile(tree, options, inputFile)
                    }
                })
            })
        })
    })

    /**
     * Runs Evaluator on given AST and outputs results into file
     * @param {array}  tree                AST node list
     * @param {object} [options={}]        Gelato config options
     * @param {string} targetFile          output filename
     * @param {string} [repeatedFile=null] repeated template filename
     */
    function evaluateToFile(tree, options, targetFile, repeatedFile = null) {
        // remove .gel extension
        const outputFile = `${options.dest}/${targetFile.slice(0, -4)}`
        // run Evaluator on given AST
        const output = Evaluator(tree, options.context)
        // output evaluation results into file
        fs.outputFile(outputFile, output, err => {
            if (err) throw err
            console.log(` 🍨  Done writing ${repeatedFile ? repeatedFile : targetFile} -> ${outputFile}`)
        })
    }

    /**
     * Output multiple files from single template file
     * @param {array}  tree         AST node list
     * @param {object} [options={}] Gelato config options
     * @param {string} inputFile    input template filename
     */
    function repeatOutput(tree, options, inputFile) {
        try {
            // prepare context object for vm to be able to use it later on
            vm.createContext(options.context)
            // evaluate repeat array variable
            const array = vm.runInContext(options.repeat[inputFile].array, options.context)
            // loop through each element in evaluated array
            array.forEach(e => {
                // create copy of option object
                const tempOptions = Object.assign({}, options)
                // sets repeat variable in context to have the value of array element
                tempOptions.context[options.repeat[inputFile].variable] = e
                // run Gelato on repeat template filename
                Gelato.runOnString(options.repeat[inputFile].filename, tempOptions, file => {
                    // evaluate AST to the evaluated template filename
                    evaluateToFile(tree, tempOptions, `${inputFile.substr(0, inputFile.lastIndexOf('/') + 1)}${file}`, inputFile)
                })
            })
        } catch (err) {
            if (err.name !== 'ReferenceError' && err.name !== 'SyntaxError') throw err
        }
    }
}

module.exports = Gelato
