import { z } from 'zod'

export const CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
} as const

interface OperatorConfig {
  readonly symbol: string
  readonly label: string
  readonly description: string
  readonly precedence: number
  readonly associativity?: 'left' | 'right'
  readonly isFunction?: boolean
}

export const OPERATORS: Record<string, OperatorConfig> = {
  '+': { symbol: '+', label: '+', description: 'Сложение', precedence: 1, associativity: 'left' },
  '-': { symbol: '-', label: '−', description: 'Вычитание', precedence: 1, associativity: 'left' },
  '*': { symbol: '*', label: '×', description: 'Умножение', precedence: 2, associativity: 'left' },
  '/': { symbol: '/', label: '÷', description: 'Деление', precedence: 2, associativity: 'left' },
  '**': { symbol: '**', label: 'xⁿ', description: 'Степень', precedence: 3, associativity: 'right' },
  '%': { symbol: '%', label: '%', description: 'Остаток', precedence: 2, associativity: 'left' },
  'sqrt': { symbol: 'sqrt', label: '√x', description: 'Квадратный корень', precedence: 4, isFunction: true },
  'abs': { symbol: 'abs', label: '|x|', description: 'Модуль', precedence: 4, isFunction: true },
} as const

export type CalculatorOperator = keyof typeof OPERATORS

export const calculateRequestSchema = z.object({
  expression: z.string().min(1).max(500),
})

export type CalculateRequest = z.infer<typeof calculateRequestSchema>

export type CalculationResult =
  | {
      success: true
      expression: string
      result: number
    }
  | {
      success: false
      error: string
      responseError: string
    }

/**
 * Custom Parser Implementation
 */

type Token = 
  | { type: 'NUMBER'; value: number }
  | { type: 'OPERATOR'; value: string }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' }
  | { type: 'COMMA' }

const MAX_TOKENS = 200

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  // Replace symbols with keys for easier parsing
  const normalized = input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, Math.PI.toString())
    .replace(/e/g, Math.E.toString())

  while (i < normalized.length) {
    if (tokens.length >= MAX_TOKENS) {
      throw new Error('Выражение слишком сложное')
    }

    const char = normalized[i]
    if (char === undefined) break

    if (/\s/.test(char)) {
      i++
      continue
    }

    // P1: Strict numeric literal parsing
    const numMatch = normalized.slice(i).match(/^(\d+(\.\d*)?|\.\d+)/)
    if (numMatch) {
      const numStr = numMatch[0]
      const nextChar = normalized[i + numStr.length]
      
      // Reject if followed immediately by another dot or digit (partial parse check)
      if (nextChar === '.' || (nextChar !== undefined && /\d/.test(nextChar))) {
         throw new Error(`Некорректное числовое значение: ${numStr}${nextChar}...`)
      }
      
      const parsed = parseFloat(numStr)
      if (Number.isNaN(parsed)) {
        throw new Error(`Ошибка разбора числа: ${numStr}`)
      }
      
      tokens.push({ type: 'NUMBER', value: parsed })
      i += numStr.length
      continue
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN' })
      i++
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN' })
      i++
      continue
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA' })
      i++
      continue
    }

    // Check for operators (multi-char like **)
    let foundOp = false
    const remaining = normalized.slice(i)
    
    // Sort operators by length descending to match ** before *
    const sortedOps = Object.keys(OPERATORS).sort((a, b) => b.length - a.length)
    
    for (const op of sortedOps) {
      if (remaining.startsWith(op)) {
        const opDef = OPERATORS[op]
        
        // P2: Enforce mandatory parentheses for functions
        if (opDef?.isFunction) {
          // Look ahead for '(' (skip whitespace)
          let lookAhead = i + op.length
          while (lookAhead < normalized.length && /\s/.test(normalized[lookAhead] as string)) {
            lookAhead++
          }
          if (normalized[lookAhead] !== '(') {
            throw new Error(`Функция ${op} требует открывающую скобку: ${op}(...)`)
          }
        }

        const lastToken = tokens[tokens.length - 1]
        // Handle unary minus
        if (op === '-' && (tokens.length === 0 || lastToken?.type === 'OPERATOR' || lastToken?.type === 'LPAREN')) {
           tokens.push({ type: 'NUMBER', value: 0 })
        }
        
        tokens.push({ type: 'OPERATOR', value: op })
        i += op.length
        foundOp = true
        break
      }
    }

    if (!foundOp) {
      throw new Error(`Неизвестный символ: ${char}`)
    }
  }

  return tokens
}

function shuntingYard(tokens: Token[]): Token[] {
  const outputQueue: Token[] = []
  const operatorStack: Token[] = []

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token)
    } else if (token.type === 'OPERATOR') {
      const op1 = OPERATORS[token.value]
      if (!op1) throw new Error(`Неизвестный оператор: ${token.value}`)

      if (op1.isFunction) {
        operatorStack.push(token)
      } else {
        while (operatorStack.length > 0) {
          const topToken = operatorStack[operatorStack.length - 1]
          if (!topToken || topToken.type !== 'OPERATOR') break
          
          const op2 = OPERATORS[topToken.value]
          if (!op2) break

          if (
            (op1.associativity === 'left' && op1.precedence <= op2.precedence) ||
            (op1.associativity === 'right' && op1.precedence < op2.precedence)
          ) {
            outputQueue.push(operatorStack.pop()!)
          } else {
            break
          }
        }
        operatorStack.push(token)
      }
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token)
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1]?.type !== 'LPAREN') {
        outputQueue.push(operatorStack.pop()!)
      }
      if (operatorStack.length === 0) throw new Error('Несогласованные скобки')
      operatorStack.pop() // Pop LPAREN
      
      const lastOpToken = operatorStack[operatorStack.length - 1]
      if (lastOpToken?.type === 'OPERATOR') {
        const topOp = OPERATORS[lastOpToken.value]
        if (topOp?.isFunction) {
          outputQueue.push(operatorStack.pop()!)
        }
      }
    }
  }

  while (operatorStack.length > 0) {
    const token = operatorStack.pop()!
    if (token.type === 'LPAREN') throw new Error('Несогласованные скобки')
    outputQueue.push(token)
  }

  return outputQueue
}

function evaluateRPN(tokens: Token[]): number {
  const stack: number[] = []

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      stack.push(token.value)
    } else if (token.type === 'OPERATOR') {
      const op = OPERATORS[token.value]
      if (!op) throw new Error(`Неизвестный оператор: ${token.value}`)

      if (op.isFunction) {
        if (stack.length < 1) throw new Error('Недостаточно аргументов для функции')
        const a = stack.pop()!
        stack.push(runOperation(a, 0, token.value as CalculatorOperator))
      } else {
        if (stack.length < 2) throw new Error('Недостаточно операндов для операции')
        const b = stack.pop()!
        const a = stack.pop()!
        stack.push(runOperation(a, b, token.value as CalculatorOperator))
      }
    }
  }

  if (stack.length !== 1) throw new Error('Ошибка в выражении')
  const finalResult = stack[0]
  if (finalResult === undefined) throw new Error('Ошибка вычисления')
  return finalResult
}

export function calculate({ expression }: CalculateRequest): CalculationResult {
  try {
    const tokens = tokenize(expression)
    const rpn = shuntingYard(tokens)
    const result = evaluateRPN(rpn)

    if (!Number.isFinite(result)) {
      return {
        success: false,
        error: 'Результат вне допустимого диапазона',
        responseError: 'Результат вне допустимого диапазона',
      }
    }

    return {
      success: true,
      expression,
      result,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка парсинга'
    return {
      success: false,
      error: message,
      responseError: message,
    }
  }
}

export function parseOperandInput(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

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
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': 
      if (b === 0) throw new Error('Деление на ноль')
      return a / b
    case '**': return a ** b
    case '%': 
      if (b === 0) throw new Error('Деление на ноль')
      return a % b
    case 'sqrt': 
      if (a < 0) throw new Error('Корень из отрицательного числа')
      return Math.sqrt(a)
    case 'abs': return Math.abs(a)
    default: throw new Error(`Неподдерживаемая операция: ${operator}`)
  }
}
