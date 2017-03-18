const assert = require('assert')
const exec = require('child_process').exec
const fs = require('fs-extra')

/* global describe beforeEach it */
describe('E2E: CLI', function () {
    this.timeout(5000)

    beforeEach(cb => {
        fs.emptyDir('test-files/temp', err => {
            if (err) throw err
            cb()
        })
    })

    function runGelato(input, expected, options, cb, dest = 'build', overrideContext = false) {
        fs.outputFile('test-files/temp/temp.txt.gel', input, err => {
            if (err) throw err
            exec(`gelato ${overrideContext ? '' : `-C '${JSON.stringify({ name: 'Mark' })}'`} ${options}`, { cwd: 'test-files/temp' }, err => {
                if (err) throw err
                fs.readFile(`test-files/temp/${dest}/temp.txt`, 'utf8', (err, data) => {
                    if (err) throw err
                    assert.equal(data, expected)
                    cb()
                })
            })
        })
    }

    it('should handle src file given with no options', cb => {
        runGelato('Hello [[ name ]]', 'Hello Mark', '', cb)
    })

    it('should handle src file given with --dest flag', cb => {
        runGelato('Hello [[ name ]]', 'Hello Mark', '--dest hello', cb, 'hello')
    })

    it('should handle src file given with -d flag', cb => {
        runGelato('Hello [[ name ]]', 'Hello Mark', '-d hello2', cb, 'hello2')
    })

    it('should handle src file given with --context flag', cb => {
        runGelato('Hello [[ name ]]', 'Hello Jack', `--context '${JSON.stringify({ name: 'Jack' })}'`, cb, 'build', true)
    })

    it('should handle src file given with -C flag', cb => {
        runGelato('Hello [[ name ]]', 'Hello Jack', `-C '${JSON.stringify({ name: 'Jack' })}'`, cb, 'build', true)
    })

    it('should handle src file given with --expression-start-tag flag', cb => {
        runGelato('Hello {{ name ]]', 'Hello Mark', '--expression-start-tag {{', cb)
    })

    it('should handle src file given with --expression-end-tag flag', cb => {
        runGelato('Hello [[ name }}', 'Hello Mark', '--expression-end-tag }}', cb)
    })

    it('should handle src file given with both --expression-start-tag and --expression-end-tag flags', cb => {
        runGelato('Hello {{ name }}', 'Hello Mark', '--expression-start-tag {{ --expression-end-tag }}', cb)
    })

    it('should handle src file given with --control-start-tag flag', cb => {
        runGelato('Hello{{ if 0 !] there{{ eif !]', 'Hello', '--control-start-tag {{', cb)
    })

    it('should handle src file given with --control-end-tag flag', cb => {
        runGelato('Hello[! if 0 }} there[! eif }}', 'Hello', '--control-end-tag }}', cb)
    })

    it('should handle src file given with both --control-start-tag and --control-end-tag flags', cb => {
        runGelato('Hello{{ if 0 }} there{{ eif }}', 'Hello', '--control-start-tag {{ --control-end-tag }}', cb)
    })

    it('should handle src file given with --include-start-tag flag', cb => {
        runGelato('File says: {{ ../text.txt @]', 'File says: Hello Mark!\n', '--include-start-tag {{', cb)
    })

    it('should handle src file given with --include-end-tag flag', cb => {
        runGelato('File says: [@ ../text.txt }}', 'File says: Hello Mark!\n', '--include-end-tag }}', cb)
    })

    it('should handle src file given with both --include-start-tag and --include-end-tag flags', cb => {
        runGelato('File says: {{ ../text.txt }}', 'File says: Hello Mark!\n', '--include-start-tag {{ --include-end-tag }}', cb)
    })
})
