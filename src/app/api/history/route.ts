import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const historyLimitSchema = z.coerce.number().int().min(1).max(200)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const parsedLimit = limitParam
      ? historyLimitSchema.safeParse(limitParam)
      : { success: true as const, data: 50 }

    if (!parsedLimit.success) {
      return NextResponse.json(
        { error: 'Параметр limit должен быть целым числом от 1 до 200' },
        { status: 400 }
      )
    }

    const calculations = await db.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: parsedLimit.data,
    })

    const operatorSymbols: Record<string, string> = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷',
      '**': '^',
      '%': '%',
    }

    const history = calculations.map((c) => ({
      id: c.id,
      operandA: c.operandA,
      operandB: c.operandB,
      operator: c.operator,
      symbol: operatorSymbols[c.operator] || c.operator,
      result: c.result,
      error: c.error,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({ success: true, history })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.calculation.deleteMany()
    return NextResponse.json({ success: true, message: 'История очищена' })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
