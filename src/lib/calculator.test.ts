import { describe, expect, it } from 'vitest'
import {
  calculate,
  calculateRequestSchema,
  formatCalculatorResult,
  parseOperandInput,
} from './calculator'

describe('calculate', () => {
  it.each([
    [{ a: 5, b: 3, operator: '+' as const }, 8, '5 + 3'],
    [{ a: 10, b: 4, operator: '-' as const }, 6, '10 - 4'],
    [{ a: 7, b: 6, operator: '*' as const }, 42, '7 × 6'],
    [{ a: 20, b: 5, operator: '/' as const }, 4, '20 ÷ 5'],
    [{ a: 2, b: 3, operator: '**' as const }, 8, '2 ^ 3'],
    [{ a: 10, b: 3, operator: '%' as const }, 1, '10 % 3'],
  ])('calculates %j', (request, expectedResult, expectedExpression) => {
    const result = calculate(request)

    expect(result).toMatchObject({
      success: true,
      expression: expectedExpression,
      result: expectedResult,
    })
  })

  it.each([
    { a: 20, b: 0, operator: '/' as const },
    { a: 20, b: 0, operator: '%' as const },
  ])('rejects zero divisor for %j', (request) => {
    const result = calculate(request)

    expect(result).toMatchObject({
      success: false,
      error: 'Деление на ноль',
      responseError: 'Деление на ноль невозможно',
    })
  })

  it('rejects non-finite arithmetic results', () => {
    const result = calculate({ a: Number.MAX_VALUE, b: 2, operator: '*' })

    expect(result).toMatchObject({
      success: false,
      error: 'Результат вне допустимого диапазона',
    })
  })
})

describe('calculateRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(
      calculateRequestSchema.safeParse({ a: 1, b: 2, operator: '+' }).success
    ).toBe(true)
  })

  it.each([
    { a: Number.NaN, b: 2, operator: '+' },
    { a: Number.POSITIVE_INFINITY, b: 2, operator: '+' },
    { a: 1, b: 2, operator: 'sqrt' },
    { a: 1, b: 2, operator: '+', extra: true },
  ])('rejects invalid request %j', (request) => {
    expect(calculateRequestSchema.safeParse(request).success).toBe(false)
  })
})

describe('parseOperandInput', () => {
  it.each([
    ['42', 42],
    [' 3.5 ', 3.5],
    ['3,5', 3.5],
    ['-0.25', -0.25],
  ])('parses %s', (input, expected) => {
    expect(parseOperandInput(input)).toBe(expected)
  })

  it.each(['', '   ', '12abc', 'Infinity', 'NaN'])('rejects %s', (input) => {
    expect(parseOperandInput(input)).toBeNull()
  })
})

describe('formatCalculatorResult', () => {
  it.each([
    [42, '42'],
    [1.5, '1.5'],
    [1 / 3, '0.333333'],
    [2.5000001, '2.5'],
  ])('formats %s', (input, expected) => {
    expect(formatCalculatorResult(input)).toBe(expected)
  })
})
