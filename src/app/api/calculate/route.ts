import { db } from '@/lib/db'
import { calculate, calculateRequestSchema } from '@/lib/calculator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedBody = calculateRequestSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Неверные параметры. Укажите числа и оператор (+, -, *, /, **, %)' },
        { status: 400 }
      )
    }

    const { a, b, operator } = parsedBody.data
    const calculation = calculate(parsedBody.data)

    if (!calculation.success) {
      const calc = await db.calculation.create({
        data: {
          operandA: a,
          operandB: b,
          operator,
          error: calculation.error,
        },
      })

      return NextResponse.json({
        success: false,
        error: calculation.responseError,
        id: calc.id,
      })
    }

    const calc = await db.calculation.create({
      data: {
        operandA: a,
        operandB: b,
        operator,
        result: calculation.result,
      },
    })

    return NextResponse.json({
      success: true,
      expression: calculation.expression,
      result: calculation.result,
      id: calc.id,
    })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
