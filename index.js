const vm = require('vm')
const fs = require('fs-extra')
const globby = require('globby')

const Tokenizer = require('./lib/tokenizer')
const Parser    = require('./lib/parser')
const Evaluator = require('./lib/evaluator')

const Gelato = {}

Gelato.runOnString = (input, options = { context: {} }, cb = () => {}) => {
    return Tokenizer(input, options, tokens => {
        cb(Evaluator(Parser(tokens), options.context))
    })
}

Gelato.run = (options = {}) => {
    console.log()
    console.log('Welcome to Gelato! 👋')
    console.log()

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

    globby(options.src).then(paths => {
        paths.forEach(inputFile => {
            console.log(` 👓  Reading ${inputFile}`)
            fs.readFile(inputFile, 'utf8', (err, inputData) => {
                if (err) throw err
                Tokenizer(inputData, options, tokens => {
                    const tree = Parser(tokens)
                    if (options.repeat[inputFile]) {
                        repeatOutput(tree, options, inputFile)
                    } else {
                        evaluateToFile(tree, options, inputFile)
                    }
                })
            })
        })
    })

    function evaluateToFile(tree, options, targetFile, repeatedFile = null) {
        const outputFile = `${options.dest}/${targetFile.slice(0, -4)}`
        const output = Evaluator(tree, options.context)
        fs.outputFile(outputFile, output, err => {
            if (err) throw err
            console.log(` 🍨  Done writing ${repeatedFile ? repeatedFile : targetFile} -> ${outputFile}`)
        })
    }

    function repeatOutput(tree, options, inputFile) {
        try {
            vm.createContext(options.context)
            const array = vm.runInContext(options.repeat[inputFile].array, options.context)
            array.forEach(e => {
                const tempOptions = Object.assign({}, options)
                tempOptions.context[options.repeat[inputFile].variable] = e
                Gelato.runOnString(options.repeat[inputFile].filename, tempOptions, file => {
                    evaluateToFile(tree, tempOptions, `${inputFile.substr(0, inputFile.lastIndexOf('/'))}/${file}`, inputFile)
                })
            })
        } catch (err) {
            if (err.name !== 'ReferenceError' && err.name !== 'SyntaxError') throw err
        }
    }
}

module.exports = Gelato
