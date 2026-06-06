'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  Zap,
  ArrowUpRight,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface HistoryItem {
  id: string
  operandA: number
  operandB: number
  operator: string
  symbol: string
  result: number | null
  error: string | null
  createdAt: string
}

const OPERATORS = [
  { key: '+', label: '+', icon: Plus, description: 'Сложение', color: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700', ringColor: 'ring-emerald-500/30' },
  { key: '-', label: '−', icon: Minus, description: 'Вычитание', color: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700', ringColor: 'ring-rose-500/30' },
  { key: '*', label: '×', icon: X, description: 'Умножение', color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700', ringColor: 'ring-amber-500/30' },
  { key: '/', label: '÷', icon: Divide, description: 'Деление', color: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700', ringColor: 'ring-violet-500/30' },
  { key: '**', label: 'xⁿ', description: 'Степень', color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700', ringColor: 'ring-orange-500/30' },
  { key: '%', label: '%', icon: Percent, description: 'Остаток', color: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700', ringColor: 'ring-teal-500/30' },
] as const

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [operandA, setOperandA] = useState('')
  const [operandB, setOperandB] = useState('')
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      if (data.success) {
        setHistory(data.history)
      }
    } catch {
      // silently fail
    }
  }

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => [item, ...prev])
  }, [])

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' })
      setHistory([])
      toast.success('История очищена')
    } catch {
      toast.error('Не удалось очистить историю')
    }
  }

  const applyFromHistory = (item: HistoryItem) => {
    if (item.result !== null) {
      const formatted = Number.isInteger(item.result)
        ? item.result.toString()
        : item.result.toFixed(6).replace(/\.?0+$/, '')
      setOperandA(formatted)
      setSelectedOperator(null)
      setOperandB('')
      setResult(null)
      setError(null)
      toast.success('Результат скопирован в поле A')
    }
  }

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
        addToHistory({
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
        addToHistory({
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
  }, [operandA, operandB, selectedOperator, addToHistory])

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

  if (!mounted) return null

  const selectedOp = OPERATORS.find(o => o.key === selectedOperator)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Калькулятор</h1>
              <p className="text-xs text-muted-foreground">6 операций · История вычислений</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Zap className="h-3 w-3" />
              Next.js 16
            </Badge>
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
                    <span className="sr-only">Переключить тему</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Переключить тему</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-6 lg:py-10">
        <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-5">
          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <Card className="p-5 sm:p-6 shadow-xl border-0 bg-card/60 backdrop-blur-sm">
              {/* Display */}
              <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`expr-${operandA}-${selectedOperator}-${operandB}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-muted-foreground font-mono truncate"
                    >
                      {operandA && selectedOperator && operandB
                        ? `${operandA} ${selectedOp?.label || selectedOperator} ${operandB}`
                        : 'Введите выражение...'}
                    </motion.p>
                  </AnimatePresence>
                  {selectedOp && (
                    <Badge variant="outline" className={`text-xs px-2 py-0 ${selectedOp.color.replace(/bg-|dark:/g, 'text-').split(' ').slice(-1)[0]} border-0`}>
                      {selectedOp.description}
                    </Badge>
                  )}
                </div>

                <div className="min-h-[3rem] flex items-center">
                  <AnimatePresence mode="wait">
                    {result !== null ? (
                      <motion.span
                        key="result"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="text-4xl sm:text-5xl font-bold font-mono text-foreground"
                      >
                        = {result}
                      </motion.span>
                    ) : lastResult && !operandA ? (
                      <motion.button
                        key="last-result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleUseLastResult}
                        className="text-xl font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-2"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        {lastResult}
                      </motion.button>
                    ) : (
                      <motion.span
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl sm:text-5xl font-light text-muted-foreground/20"
                      >
                        0
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

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

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Первое число (A)
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
                    className="w-full px-3 sm:px-4 py-3 text-lg sm:text-xl font-mono rounded-xl border border-border/50 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    aria-label="Первое число"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Второе число (B)
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
                    className="w-full px-3 sm:px-4 py-3 text-lg sm:text-xl font-mono rounded-xl border border-border/50 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    aria-label="Второе число"
                  />
                </div>
              </div>

              {/* Operators */}
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Операция
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATORS.map((op) => {
                    const isSelected = selectedOperator === op.key
                    return (
                      <TooltipProvider key={op.key} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div whileTap={{ scale: 0.93 }}>
                              <Button
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => {
                                  setSelectedOperator(op.key)
                                  setResult(null)
                                }}
                                className={`h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${
                                  isSelected
                                    ? `${op.color} text-white shadow-lg border-0 ring-2 ${op.ringColor} ring-offset-2 ring-offset-background`
                                    : 'hover:bg-muted/80 hover:border-border/80'
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

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
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
                      <motion.div whileTap={{ scale: 0.93 }}>
                        <Button
                          variant="outline"
                          onClick={handleClear}
                          className="h-12 px-4 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Очистить поля</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          </motion.div>

          {/* History Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0 bg-card/60 backdrop-blur-sm flex flex-col h-full">
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">История</h2>
                  <Badge variant="secondary" className="text-xs font-mono ml-1">
                    {history.length}
                  </Badge>
                </div>
                {history.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearHistory}
                          className="h-7 w-7 rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Очистить историю</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Separator className="mx-4 w-auto" />

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                  <div className="p-4 rounded-2xl bg-muted/20 mb-3">
                    <Clock className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">Пока нет вычислений</p>
                  <p className="text-xs mt-1">Результаты появятся здесь</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 max-h-[500px]">
                  <div className="p-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {history.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -100, scale: 0.8 }}
                          transition={{ duration: 0.2, delay: index === 0 ? 0 : 0 }}
                          className={`group p-3 rounded-xl border transition-colors cursor-pointer ${
                            item.error
                              ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10'
                              : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                          }`}
                          onClick={() => item.result !== null && applyFromHistory(item)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {new Date(item.createdAt).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                            {item.result !== null && (
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
                            )}
                          </div>
                          <p className="text-sm font-mono text-foreground/80">
                            {item.operandA} {item.symbol} {item.operandB}
                          </p>
                          <p className={`text-base font-bold font-mono mt-0.5 ${
                            item.error ? 'text-destructive' : 'text-foreground'
                          }`}>
                            {item.error ? item.error : `= ${Number.isInteger(item.result) ? item.result : item.result?.toFixed(6).replace(/\.?0+$/, '')}`}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-4 bg-background/50">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
          Создано на базе Python-калькулятора · Next.js 16 + TypeScript + Tailwind CSS 4 + Prisma
        </div>
      </footer>
    </div>
  )
}
