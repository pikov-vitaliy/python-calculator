'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  Trash2,
  History,
  Sun,
  Moon,
  Divide,
  X,
  Plus,
  Minus,
  Percent,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import type { HistoryItem } from './history-panel'

const OPERATORS = [
  { key: '+', label: '+', icon: Plus, description: 'Сложение', color: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700' },
  { key: '-', label: '−', icon: Minus, description: 'Вычитание', color: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700' },
  { key: '*', label: '×', icon: X, description: 'Умножение', color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700' },
  { key: '/', label: '÷', icon: Divide, description: 'Деление', color: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700' },
  { key: '**', label: 'xⁿ', description: 'Степень', color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700' },
  { key: '%', label: '%', icon: Percent, description: 'Остаток', color: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700' },
] as const

interface CalculatorProps {
  onResult: (item: HistoryItem) => void
}

export default function CalculatorDisplay({ onResult }: CalculatorProps) {
  const { theme, setTheme } = useTheme()
  const [operandA, setOperandA] = useState('')
  const [operandB, setOperandB] = useState('')
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const handleCalculate = useCallback(async () => {
    const a = parseFloat(operandA)
    const b = parseFloat(operandB)

    if (isNaN(a) || isNaN(b) || !selectedOperator) {
      setError('Введите оба числа и выберите операцию')
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsCalculating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a, b, operator: selectedOperator }),
      })
      const data = await res.json()

      if (data.success) {
        const formatted = Number.isInteger(data.result)
          ? data.result.toString()
          : data.result.toFixed(6).replace(/\.?0+$/, '')
        setResult(formatted)
        setLastResult(formatted)
        onResult({
          id: data.id,
          operandA: a,
          operandB: b,
          operator: selectedOperator,
          symbol: data.expression.split(' ')[1],
          result: data.result,
          error: null,
          createdAt: new Date().toISOString(),
        })
      } else {
        setError(data.error || 'Ошибка вычисления')
        onResult({
          id: data.id,
          operandA: a,
          operandB: b,
          operator: selectedOperator,
          symbol: OPERATORS.find(o => o.key === selectedOperator)?.label || selectedOperator,
          result: null,
          error: data.error,
          createdAt: new Date().toISOString(),
        })
      }
    } catch {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsCalculating(false)
    }
  }, [operandA, operandB, selectedOperator, onResult])

  const handleClear = () => {
    setOperandA('')
    setOperandB('')
    setSelectedOperator(null)
    setResult(null)
    setError(null)
  }

  const handleUseLastResult = () => {
    if (lastResult) {
      setOperandA(lastResult)
      setResult(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Калькулятор</h1>
              <p className="text-xs text-muted-foreground">Полный набор операций</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Переключить тему</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-5">
          {/* Calculator Card */}
          <Card className="lg:col-span-3 p-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            {/* Display */}
            <div className="mb-6 p-4 rounded-2xl bg-muted/50 border border-border/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key="expression"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-muted-foreground font-mono h-6"
                >
                  {operandA && selectedOperator && operandB
                    ? `${operandA} ${OPERATORS.find(o => o.key === selectedOperator)?.label || selectedOperator} ${operandB}`
                    : '\u00A0'}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {result !== null ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl font-bold font-mono text-foreground mt-1"
                  >
                    = {result}
                  </motion.div>
                ) : lastResult && !operandA ? (
                  <motion.div
                    key="last-result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-mono text-muted-foreground/60 mt-1 cursor-pointer hover:text-muted-foreground transition-colors"
                    onClick={handleUseLastResult}
                    title="Нажмите, чтобы использовать прошлый результат"
                  >
                    ← {lastResult}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-light text-muted-foreground/30 mt-1"
                  >
                    ?
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Number Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Первое число
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={operandA}
                  onChange={(e) => {
                    setOperandA(e.target.value)
                    setResult(null)
                  }}
                  placeholder="0"
                  className="w-full px-4 py-3 text-xl font-mono rounded-xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Второе число
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={operandB}
                  onChange={(e) => {
                    setOperandB(e.target.value)
                    setResult(null)
                  }}
                  placeholder="0"
                  className="w-full px-4 py-3 text-xl font-mono rounded-xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                />
              </div>
            </div>

            {/* Operator Buttons */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Операция
              </label>
              <div className="grid grid-cols-3 gap-2">
                {OPERATORS.map((op) => {
                  const isSelected = selectedOperator === op.key
                  return (
                    <TooltipProvider key={op.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => {
                                setSelectedOperator(op.key)
                                setResult(null)
                              }}
                              className={`h-14 text-lg font-bold rounded-xl transition-all ${
                                isSelected
                                  ? `${op.color} text-white shadow-md border-0`
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {op.label}
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>{op.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Вычисляю...
                    </>
                  ) : (
                    <>
                      Вычислить
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={handleClear}
                        className="h-12 px-4 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Очистить</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>

          {/* History Card */}
          <Card className="lg:col-span-2 p-4 shadow-lg border-0 bg-card/50 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">История</h2>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                <Clock className="h-3 w-3 mr-1" />
                сейчас
              </Badge>
            </div>
            <Separator className="mb-3" />
            <div className="flex-1">
              <EmptyHistory />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
          Калькулятор на основе Python → Next.js с историей вычислений
        </div>
      </footer>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/50">
      <div className="p-3 rounded-full bg-muted/30 mb-3">
        <History className="h-6 w-6" />
      </div>
      <p className="text-sm">Пока нет вычислений</p>
      <p className="text-xs mt-1">Результаты появятся здесь</p>
    </div>
  )
}
