const fs = require('fs-extra')
const globby = require('globby');

const Tokenizer = require('./lib/tokenizer')
const Parser    = require('./lib/parser')
const Evaluator = require('./lib/evaluator')

const Gelato = {}

console.log()
console.log('Welcome to Gelato! 👋')
console.log()

Gelato.runOnString = (input, options = { context: {} }) => {
    return Evaluator(Parser(Tokenizer(input, options)), options.context)
}

Gelato.run = (options = {}) => {
    options = Object.assign({
        src: '**/*.gel',
        dest: 'build',
        context: {},
    }, options)

    globby(options.src).then(paths => {
        paths.forEach(inputFile => {
            console.log(` 👓  Reading ${inputFile}`)
            fs.readFile(inputFile, 'utf8', (err, inputData) => {
                if (err) throw err
                const file = `${options.dest}/${inputFile.slice(0, -4)}`
                const data = Gelato.runOnString(inputData, options)
                fs.outputFile(file, data, err => {
                    if (err) throw err
                    console.log(` 🍨  Done writing: ${inputFile} -> ${file}`)
                })
            })
        })
    })
}

module.exports = Gelato
