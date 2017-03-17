const assert = require('assert')

const K = require('../../lib/constants')
const Parser = require('../../lib/parser')

/* global describe it */
describe('Parser', () => {
    const errorLocation = '(x:y:z)\n        abc'

    it('should return [] when the given [] tokens', () => {
        assert.deepEqual(Parser([]), [])
    })

    it('should return PLAIN node when given PLAIN token', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_PLAIN, value: 'hello', errorLocation },
        ]), [
            { type: K.NODE_PLAIN, value: 'hello', errorLocation },
        ])
    })

    it('should return EXPRESSION node when given EXPRESSION token', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_EXPRESSION, value: 'x', errorLocation },
        ]), [
            { type: K.NODE_EXPRESSION, value: 'x', errorLocation },
        ])
    })

    it('should return FOR node when given [FOR, EFOR] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_FOR, value: 'x in xs', errorLocation },
            { type: K.TOKEN_EFOR, value: null },
        ]), [{ type: K.NODE_FOR, variable: 'x', array: 'xs', nodes: [], errorLocation }])
    })

    it('should return FOR node when given [FOR, PLAIN, EFOR] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_FOR, value: 'x in xs', errorLocation },
            { type: K.TOKEN_PLAIN, value: 'hello', errorLocation },
            { type: K.TOKEN_EFOR, value: null },
        ]), [{ type: K.NODE_FOR, variable: 'x', array: 'xs', nodes: [
            { type: K.NODE_PLAIN, value: 'hello', errorLocation },
        ], errorLocation }])
    })

    it('should return IF node when given [IF, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [], elseNodes: [], nodes: [], errorLocation }])
    })

    it('should return IF node when given [IF, PLAIN, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.NODE_PLAIN, value: 'hello', errorLocation },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [], elseNodes: [], nodes: [
            { type: K.NODE_PLAIN, value: 'hello', errorLocation },
        ], errorLocation }])
    })

    it('should return IF node when given [IF, ELSEIF, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.TOKEN_ELSEIF, value: 'y === 2' },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [] },
        ], elseNodes: [], nodes: [], errorLocation }])
    })

    it('should return IF node when given [IF, ELSEIF, ELSEIF, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.TOKEN_ELSEIF, value: 'y === 2' },
            { type: K.TOKEN_ELSEIF, value: 'y === 3' },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [] },
            { condition: 'y === 3', nodes: [] },
        ], elseNodes: [], nodes: [], errorLocation }])
    })

    it('should return IF node when given [IF, ELSE, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.TOKEN_ELSE, value: null },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [], elseNodes: [], nodes: [], errorLocation }])
    })

    it('should return IF node when given [IF, ELSEIF, ELSEIF, ELSE, EIF] tokens', () => {
        assert.deepEqual(Parser([
            { type: K.TOKEN_IF, value: 'x === 1', errorLocation },
            { type: K.TOKEN_ELSEIF, value: 'y === 2' },
            { type: K.TOKEN_ELSEIF, value: 'y === 3' },
            { type: K.TOKEN_ELSE, value: null },
            { type: K.TOKEN_EIF, value: null },
        ]), [{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [] },
            { condition: 'y === 3', nodes: [] },
        ], elseNodes: [], nodes: [], errorLocation }])
    })

    it('should throw Parser Error when EFor token is not found', () => {
        assert.throws(() => Parser([
            { type: K.TOKEN_FOR, value: 'x in xs' },
        ]), /Parser Error/)
    })

    it('should throw Parser Error when EIf token is not found', () => {
        assert.throws(() => Parser([
            { type: K.TOKEN_IF, value: 'x === 1' },
        ]), /Parser Error/)
    })
})
