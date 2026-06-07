import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OPERATORS } from '@/lib/calculator'

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

    const history = calculations.map((c) => {
      let displayExpression = c.fullExpression

      if (!displayExpression && c.operandA !== null && c.operator) {
        const opKey = c.operator as keyof typeof OPERATORS
        const symbol = OPERATORS[opKey]?.symbol || c.operator
        
        if (OPERATORS[opKey]?.isFunction) {
           displayExpression = `${symbol}(${c.operandA})`
        } else {
           displayExpression = `${c.operandA} ${symbol} ${c.operandB ?? ''}`.trim()
        }
      }

      return {
        id: c.id,
        expression: displayExpression || 'Неизвестное выражение',
        result: c.result,
        error: c.error,
        createdAt: c.createdAt,
      }
    })

    return NextResponse.json({ success: true, history })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hasIdParam = searchParams.has('id')
    const rawId = searchParams.get('id')

    if (hasIdParam) {
      const id = rawId?.trim()
      if (!id) {
        return NextResponse.json({ error: 'ID не может быть пустым' }, { status: 400 })
      }

      try {
        await db.calculation.delete({ where: { id } })
        return NextResponse.json({ success: true, message: 'Запись удалена' })
      } catch (err: unknown) {
        // Prisma error code for "Record to delete does not exist"
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
          return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
        }
        throw err
      }
    }

    await db.calculation.deleteMany()
    return NextResponse.json({ success: true, message: 'История очищена' })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
