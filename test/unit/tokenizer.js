const assert = require('assert')

const K = require('../../lib/constants')
const Tokenizer = require('../../lib/tokenizer')

/* global describe it */
describe('Tokenizer', () => {
    function assertTokenizer(input, tokens) {
        Tokenizer(input, {}, actualTokens => {
            assert.deepEqual(actualTokens, tokens)
        })
    }

    it('should return [] when the input is \'\'', () => {
        assertTokenizer('', [])
    })

    it('should return PLAIN token when the input is a plain string', () => {
        assertTokenizer('hello', [{ type: K.TOKEN_PLAIN, value: 'hello' }])
    })

    it('should return EXPRESSION token when the input is \'[[ ... ]]\'', () => {
        assertTokenizer('[[ x ]]', [{ type: K.TOKEN_EXPRESSION, value: 'x' }])
    })

    it('should return FOR token when the input is \'[[ for ... ]]\'', () => {
        assertTokenizer('[! for x in xs !]', [{ type: K.TOKEN_FOR, value: 'x in xs' }])
    })

    it('should return EFOR token when the input is \'[[ efor ]]\'', () => {
        assertTokenizer('[! efor !]', [{ type: K.TOKEN_EFOR, value: null }])
    })

    it('should return IF token when the input is \'[[ if ... ]]\'', () => {
        assertTokenizer('[! if x === 1 !]', [{ type: K.TOKEN_IF, value: 'x === 1' }])
    })

    it('should return ELSEIF token when the input is \'[[ else if ... ]]\'', () => {
        assertTokenizer('[! else if y === 2 !]', [{ type: K.TOKEN_ELSEIF, value: 'y === 2' }])
    })

    it('should return ELSE token when the input is \'[[ else ]]\'', () => {
        assertTokenizer('[! else !]', [{ type: K.TOKEN_ELSE, value: null }])
    })

    it('should return EIF token when the input is \'[[ eif ]]\'', () => {
        assertTokenizer('[! eif !]', [{ type: K.TOKEN_EIF, value: null }])
    })

    it('should return array of tokens from external file when the input is \'[@ ... @]\'', () => {
        Tokenizer('[@ test/text.txt @]', {}, Tokenizer('Hello [[ name ]]!\n'))
    })

    it('should return PLAIN token for exmpty whitespace', () => {
        assertTokenizer(' ', [{ type: K.TOKEN_PLAIN, value: ' ' }])
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

    it('should throw error when expressionEndTag is missing', () => {
        assert.throws(() => Tokenizer('[[x'), /Tokenizer Error/)
    })

    it('should throw error when controlEndTag is missing', () => {
        assert.throws(() => Tokenizer('[!if'), /Tokenizer Error/)
    })

    it('should throw error when includeEndTag is missing', () => {
        assert.throws(() => Tokenizer('[@test/text.txt'), /Tokenizer Error/)
    })

    it('should throw error when control tag type is missing', () => {
        assert.throws(() => Tokenizer('[!!]'), /Tokenizer Error/)
    })

    it('should throw error when control tag type is not definable', () => {
        assert.throws(() => Tokenizer('[!hello!]'), /Tokenizer Error/)
    })
})
