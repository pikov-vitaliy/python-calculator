import CalculatorApp, {
  type HistoryItem,
} from '@/components/calculator/calculator-app'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const operatorSymbols: Record<string, string> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '**': '^',
  '%': '%',
}

export default async function Page() {
  const calculations = await db.calculation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const initialHistory: HistoryItem[] = calculations.map((calculation) => ({
    id: calculation.id,
    operandA: calculation.operandA,
    operandB: calculation.operandB,
    operator: calculation.operator,
    symbol: operatorSymbols[calculation.operator] || calculation.operator,
    result: calculation.result,
    error: calculation.error,
    createdAt: calculation.createdAt.toISOString(),
  }))

  return <CalculatorApp initialHistory={initialHistory} />
}
