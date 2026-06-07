import { describe, expect, it } from 'vitest'
import {
  calculate,
  calculateRequestSchema,
  formatCalculatorResult,
  CONSTANTS,
} from './calculator'

describe('calculate', () => {
  it.each([
    ['5 + 3', 8],
    ['10 - 4', 6],
    ['7 * 6', 42],
    ['20 / 5', 4],
    ['2 ** 3', 8],
    ['10 % 3', 1],
    ['2 + 3 * 4', 14],
    ['(2 + 3) * 4', 20],
    ['-5 + 10', 5],
    ['sqrt(16)', 4],
    ['abs(-10)', 10],
    ['(10 + 5) / 3 + sqrt(25)', 10],
    ['2 * π', 2 * Math.PI],
    ['e + 1', Math.E + 1],
  ])('calculates "%s" correctly', (expression, expected) => {
    const result = calculate({ expression })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.result).toBeCloseTo(expected)
    }
  })

  it.each([
    ['1 / 0', 'Деление на ноль'],
    ['sqrt(-1)', 'Корень из отрицательного числа'],
    ['((1+1)', 'Несогласованные скобки'],
    ['1 +', 'Недостаточно операндов для операции'],
    ['sqrt(16) +', 'Недостаточно операндов для операции'],
  ])('handles error for "%s"', (expression, expectedError) => {
    const result = calculate({ expression })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain(expectedError)
    }
  })

  it.each([
    ['1..2 + 3'],
    ['1.2.3 + 4'],
    ['5 + . . 1'],
    ['sqrt 16'],
    ['abs -10'],
  ])('rejects malformed syntax/literals for "%s"', (expression) => {
    const result = calculate({ expression })
    expect(result.success).toBe(false)
  })

  it('rejects excessively long strings via schema', () => {
    const longStr = '1+'.repeat(300)
    expect(calculateRequestSchema.safeParse({ expression: longStr }).success).toBe(false)
  })

  it('rejects complex expressions via token limit', () => {
     // A long string that passes schema but hits token limit
     const complexStr = '1+'.repeat(110) + '1' 
     const result = calculate({ expression: complexStr })
     expect(result.success).toBe(false)
     if (!result.success) {
       expect(result.error).toBe('Выражение слишком сложное')
     }
  })
})

describe('calculateRequestSchema', () => {
  it('accepts valid expression', () => {
    expect(calculateRequestSchema.safeParse({ expression: '2+2' }).success).toBe(true)
  })

  it('rejects empty expression', () => {
    expect(calculateRequestSchema.safeParse({ expression: '' }).success).toBe(false)
  })
})

describe('formatCalculatorResult', () => {
  it.each([
    [42, '42'],
    [1.5, '1.5'],
    [1 / 3, '0.333333'],
  ])('formats %s', (input, expected) => {
    expect(formatCalculatorResult(input)).toBe(expected)
  })
})

describe('CONSTANTS', () => {
  it('has PI and E', () => {
    expect(CONSTANTS.PI).toBeCloseTo(3.141592)
    expect(CONSTANTS.E).toBeCloseTo(2.71828)
  })
})
