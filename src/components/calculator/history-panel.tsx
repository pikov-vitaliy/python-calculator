export interface HistoryItem {
  id: string
  operandA: number
  operandB: number
  operator: string
  symbol: string
  result: number | null
  error: string | null
  createdAt: string
}
