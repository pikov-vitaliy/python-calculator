import { z } from 'zod'

export const OPERATORS = {
  '+': { symbol: '+', label: '+', description: 'Сложение' },
  '-': { symbol: '-', label: '−', description: 'Вычитание' },
  '*': { symbol: '×', label: '×', description: 'Умножение' },
  '/': { symbol: '÷', label: '÷', description: 'Деление' },
  '**': { symbol: '^', label: 'xⁿ', description: 'Степень' },
  '%': { symbol: '%', label: '%', description: 'Остаток' },
} as const

export type CalculatorOperator = keyof typeof OPERATORS

export const calculateRequestSchema = z
  .object({
    a: z.number().finite(),
    b: z.number().finite(),
    operator: z.enum(Object.keys(OPERATORS) as [CalculatorOperator, ...CalculatorOperator[]]),
  })
  .strict()

export type CalculateRequest = z.infer<typeof calculateRequestSchema>

export type CalculationResult =
  | {
      success: true
      expression: string
      result: number
      symbol: string
    }
  | {
      success: false
      error: string
      responseError: string
      symbol: string
    }

export function calculate({ a, b, operator }: CalculateRequest): CalculationResult {
  const operation = OPERATORS[operator]

  if ((operator === '/' || operator === '%') && b === 0) {
    return {
      success: false,
      error: 'Деление на ноль',
      responseError: 'Деление на ноль невозможно',
      symbol: operation.symbol,
    }
  }

  const result = runOperation(a, b, operator)

  if (!Number.isFinite(result)) {
    return {
      success: false,
      error: 'Результат вне допустимого диапазона',
      responseError: 'Результат вне допустимого диапазона',
      symbol: operation.symbol,
    }
  }

  return {
    success: true,
    expression: `${a} ${operation.symbol} ${b}`,
    result,
    symbol: operation.symbol,
  }
}

export function parseOperandInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.')

  if (normalized === '') {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatCalculatorResult(value: number): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(6).replace(/\.?0+$/, '')
}

function runOperation(a: number, b: number, operator: CalculatorOperator): number {
  switch (operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      return a / b
    case '**':
      return a ** b
    case '%':
      return a % b
  }
}
