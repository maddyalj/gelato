const assert = require('assert')

const K = require('../../lib/constants')
const Tokenizer = require('../../lib/tokenizer')

/* global describe it */
describe('Unit: Tokenizer', () => {
    function assertTokenizer(input, tokens) {
        Tokenizer(input, {}, '', actualTokens => {
            assert.deepEqual(actualTokens, tokens)
        })
    }

    it('should return [] when the input is \'\'', () => {
        assertTokenizer('', [])
    })

    it('should return PLAIN token when the input is a plain string', () => {
        assertTokenizer('hello', [{
            type: K.TOKEN_PLAIN,
            value: 'hello',
            errorLocation: '(:1:1)\n                hello\n                ^',
        }])
    })

    it('should return EXPRESSION token when the input is \'[[ ... ]]\'', () => {
        assertTokenizer('[[ x ]]', [{
            type: K.TOKEN_EXPRESSION,
            value: 'x',
            errorLocation: '(:1:1)\n                [[ x ]]\n                ^',
        }])
    })

    it('should return FOR token when the input is \'[[ for ... ]]\'', () => {
        assertTokenizer('[! for x in xs !]', [{
            type: K.TOKEN_FOR,
            value: 'x in xs',
            errorLocation: '(:1:1)\n                [! for x in xs !]\n                ^',
        }])
    })

    it('should return EFOR token when the input is \'[[ efor ]]\'', () => {
        assertTokenizer('[! efor !]', [{
            type: K.TOKEN_EFOR,
            value: null,
            errorLocation: '(:1:1)\n                [! efor !]\n                ^',
        }])
    })

    it('should return IF token when the input is \'[[ if ... ]]\'', () => {
        assertTokenizer('[! if x === 1 !]', [{
            type: K.TOKEN_IF,
            value: 'x === 1',
            errorLocation: '(:1:1)\n                [! if x === 1 !]\n                ^',
        }])
    })

    it('should return ELSEIF token when the input is \'[[ else if ... ]]\'', () => {
        assertTokenizer('[! else if y === 2 !]', [{
            type: K.TOKEN_ELSEIF,
            value: 'y === 2',
            errorLocation: '(:1:1)\n                [! else if y === 2 !]\n                ^',
        }])
    })

    it('should return ELSE token when the input is \'[[ else ]]\'', () => {
        assertTokenizer('[! else !]', [{
            type: K.TOKEN_ELSE,
            value: null,
            errorLocation: '(:1:1)\n                [! else !]\n                ^',
        }])
    })

    it('should return EIF token when the input is \'[[ eif ]]\'', () => {
        assertTokenizer('[! eif !]', [{
            type: K.TOKEN_EIF,
            value: null,
            errorLocation: '(:1:1)\n                [! eif !]\n                ^',
        }])
    })

    it('should return array of tokens from external file when the input is \'[@ ... @]\'', () => {
        Tokenizer('[@ test/text.txt @]', {}, Tokenizer('Hello [[ name ]]!\n'))
    })

    it('should return PLAIN token for exmpty whitespace', () => {
        assertTokenizer(' ', [{
            errorLocation: '(:1:1)\n                 \n                ^',
            type: K.TOKEN_PLAIN,
            value: ' ',
        }])
    })

    it('should return same EXPRESSION token regardless of whitespace', () => {
        Tokenizer('[[x]]', Tokenizer('[[x]]'))
    })

    it('should return same FOR token regardless of whitespace', () => {
        Tokenizer('[!for x in xs!]', Tokenizer('[! for x in xs !]'))
    })

    it('should return same EFOR token regardless of whitespace', () => {
        Tokenizer('[!efor!]', Tokenizer('[! efor !]'))
    })

    it('should return same IF token regardless of whitespace', () => {
        Tokenizer('[!if x === 1!]', Tokenizer('[! if x === 1 !]'))
    })

    it('should return same ELSEIF token regardless of whitespace', () => {
        Tokenizer('[!else if y === 2!]', Tokenizer('[! else if y === 2 !]'))
    })

    it('should return same ELSE token regardless of whitespace', () => {
        Tokenizer('[!else!]', Tokenizer('[! else !]'))
    })

    it('should return same EIF token regardless of whitespace', () => {
        Tokenizer('[!eif!]', Tokenizer('[! eif !]'))
    })

    it('should throw Tokenizer Error when expressionEndTag is missing', () => {
        assert.throws(() => Tokenizer('[[x'), /Tokenizer Error/)
    })

    it('should throw Tokenizer Error when controlEndTag is missing', () => {
        assert.throws(() => Tokenizer('[!if'), /Tokenizer Error/)
    })

    it('should throw Tokenizer Error when includeEndTag is missing', () => {
        assert.throws(() => Tokenizer('[@test/text.txt'), /Tokenizer Error/)
    })

    it('should throw Tokenizer Error when control tag type is missing', () => {
        assert.throws(() => Tokenizer('[!!]'), /Tokenizer Error/)
    })

    it('should throw Tokenizer Error when control tag type is not definable', () => {
        assert.throws(() => Tokenizer('[!hello!]'), /Tokenizer Error/)
    })
})
