import CalculatorApp, {
  type HistoryItem,
} from '@/components/calculator/calculator-app'
import { db } from '@/lib/db'
import { OPERATORS } from '@/lib/calculator'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const calculations = await db.calculation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const initialHistory: HistoryItem[] = calculations.map((c) => {
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
      createdAt: c.createdAt.toISOString(),
    }
  })

  return <CalculatorApp initialHistory={initialHistory} />
}
