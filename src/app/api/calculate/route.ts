import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const OPERATIONS: Record<
  string,
  { symbol: string; fn: (a: number, b: number) => number | null }
> = {
  '+': { symbol: '+', fn: (a, b) => a + b },
  '-': { symbol: '-', fn: (a, b) => a - b },
  '*': { symbol: '×', fn: (a, b) => a * b },
  '/': { symbol: '÷', fn: (a, b) => (b !== 0 ? a / b : null) },
  '**': { symbol: '^', fn: (a, b) => a ** b },
  '%': { symbol: '%', fn: (a, b) => (b !== 0 ? a % b : null) },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { a, b, operator } = body

    if (
      typeof a !== 'number' ||
      typeof b !== 'number' ||
      !operator ||
      !OPERATIONS[operator]
    ) {
      return NextResponse.json(
        { error: 'Неверные параметры. Укажите числа и оператор (+, -, *, /, **, %)' },
        { status: 400 }
      )
    }

    const op = OPERATIONS[operator]
    const result = op.fn(a, b)

    if (result === null) {
      const calc = await db.calculation.create({
        data: {
          operandA: a,
          operandB: b,
          operator: operator,
          error: 'Деление на ноль',
        },
      })
      return NextResponse.json({
        success: false,
        error: 'Деление на ноль невозможно',
        id: calc.id,
      })
    }

    const calc = await db.calculation.create({
      data: {
        operandA: a,
        operandB: b,
        operator: operator,
        result: result,
      },
    })

    return NextResponse.json({
      success: true,
      expression: `${a} ${op.symbol} ${b}`,
      result: result,
      id: calc.id,
    })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
