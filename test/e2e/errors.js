const assert = require('assert')
const exec = require('child_process').exec
const fs = require('fs-extra')

/* global describe beforeEach it */
describe('E2E: Errors', function () {
    this.timeout(5000)

    beforeEach(cb => {
        fs.emptyDir('temp', err => {
            if (err) throw err
            cb()
        })
    })

    function runGelato(input, expected, cb) {
        fs.outputFile('temp/temp.txt.gel', input, err => {
            if (err) throw err
            exec(`gelato -C '${JSON.stringify({ name: 'Mark' })}'`, { cwd: 'temp' }, err => {
                assert(err.message.indexOf(expected) !== -1)
                cb()
            })
        })
    }

    describe('Tokenizer', () => {
        it('should throw Tokenizer Error when expression end tag is missing', cb => {
            runGelato('Hello [[ name', 'Tokenizer Error - could not find expression end tag ]] (temp.txt.gel:1:7)', cb)
        })

        it('should throw Tokenizer Error when control end tag is missing', cb => {
            runGelato('Hello [! if', 'Tokenizer Error - could not find control end tag !] (temp.txt.gel:1:7)', cb)
        })

        it('should throw Tokenizer Error when include end tag is missing', cb => {
            runGelato('Hello [@ ../test/text.txt', 'Tokenizer Error - could not find include end tag @] (temp.txt.gel:1:7)', cb)
        })

        it('should throw Tokenizer Error when type of control end tag is missing', cb => {
            runGelato('Hello [! !]', 'Tokenizer Error - invalid control tag type (temp.txt.gel:1:7)', cb)
        })

        it('should throw Tokenizer Error when type of control end tag is invalid', cb => {
            runGelato('Hello [! hello !]', 'Tokenizer Error - invalid control tag type (temp.txt.gel:1:7)', cb)
        })
    })

    describe('Parser', () => {
        it('should throw Parser Error when Eif tag is missing', cb => {
            runGelato('[! if 1 !]hello', 'Parser Error - could not find Eif tag for If tag (temp.txt.gel:1:1)', cb)
        })

        it('should throw Parser Error when Efor tag is missing', cb => {
            runGelato('[! for [1, 2, 3] !]hello', 'Parser Error - could not find Efor tag for For tag (temp.txt.gel:1:1)', cb)
        })
    })

    describe('Evaluator', () => {
        it('should throw Evaluator Error when given invalid expression', cb => {
            runGelato('[[ name + ]]', 'Evaluator Error - Unexpected end of input (temp.txt.gel:1:1)', cb)
        })

        it('should throw Evaluator Error when given undefined variable', cb => {
            runGelato('[[ name2 ]]', 'Evaluator Error - name2 is not defined (temp.txt.gel:1:1)', cb)
        })
    })
})
