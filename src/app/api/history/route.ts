import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)

    const calculations = await db.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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
