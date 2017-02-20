const assert = require('assert')

const K = require('../../lib/constants')
const Evaluator = require('../../lib/evaluator')

/* global describe it */
describe('Evaluator', () => {
    let context = { x: 5, y: 2, xs: [1, 2, 3] }

    it('should return \'\' when the given [] tree', () => {
        assert.equal(Evaluator([]), '')
    })

    it('should return PLAIN node value when given [PLAIN] tree', () => {
        assert.equal(Evaluator([{ type: K.NODE_PLAIN, value: 'hello' }], context), 'hello')
    })

    it('should return EXPRESSION node value when given [EXPRESSION] tree', () => {
        assert.equal(Evaluator([{ type: K.NODE_EXPRESSION, value: 'x' }], context), '' + context.x)
    })

    it('should return FOR node value when given [FOR] tree', () => {
        assert.equal(Evaluator([{ type: K.NODE_FOR, variable: 'x', array: 'xs', nodes: [] }], context), '')
    })

    it('should return FOR node value when given [FOR] tree', () => {
        assert.equal(Evaluator([{ type: K.NODE_FOR, variable: 'x', array: 'xs', nodes: [
            { type: K.NODE_PLAIN, value: 'hello' },
        ] }], context), 'hellohellohello')
    })

    it('should return IF node value when given [IF] tree', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [], elseNodes: [], nodes: [] }], context), '')
    })

    it('should return IF node value when given [IF] tree of [PLAIN]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 5', elseIfs: [], elseNodes: [], nodes: [
            { type: K.NODE_PLAIN, value: 'hello' },
        ] }], context), 'hello')
    })

    it('should return IF node value when given [IF] tree with [ELSE]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [] },
        ], elseNodes: [], nodes: [] }], context), '')
    })

    it('should return IF node value when given [IF] tree with [ELSEIF, ELSEIF]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [] },
            { condition: 'y === 3', nodes: [] },
        ], elseNodes: [], nodes: [] }], context), '')
    })

    it('should return IF node value when given [IF] tree with [ELSEIF, ELSEIF, ELSE]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'y === 2', elseIfs: [
            { condition: 'y === 6', nodes: [
                { type: K.NODE_PLAIN, value: '2' },
            ] },
            { condition: 'y === 3', nodes: [
                { type: K.NODE_PLAIN, value: '3' },
            ] },
        ], elseNodes: [
            { type: K.NODE_PLAIN, value: '4' },
        ], nodes: [
            { type: K.NODE_PLAIN, value: '1' },
        ] }], context), '1')
    })

    it('should return ELSEIF node value when given [IF] tree with [ELSEIF, ELSEIF, ELSE]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 2', nodes: [
                { type: K.NODE_PLAIN, value: '2' },
            ] },
            { condition: 'y === 3', nodes: [
                { type: K.NODE_PLAIN, value: '3' },
            ] },
        ], elseNodes: [
            { type: K.NODE_PLAIN, value: '4' },
        ], nodes: [
            { type: K.NODE_PLAIN, value: '1' },
        ] }], context), '2')
    })

    it('should return ELSE node value when given [IF] tree with [ELSEIF, ELSEIF, ELSE]', () => {
        assert.equal(Evaluator([{ type: K.NODE_IF, condition: 'x === 1', elseIfs: [
            { condition: 'y === 5', nodes: [
                { type: K.NODE_PLAIN, value: '2' },
            ] },
            { condition: 'y === 3', nodes: [
                { type: K.NODE_PLAIN, value: '3' },
            ] },
        ], elseNodes: [
            { type: K.NODE_PLAIN, value: '4' },
        ], nodes: [
            { type: K.NODE_PLAIN, value: '1' },
        ] }], context), '4')
    })
})
