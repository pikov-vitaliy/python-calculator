'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  Zap,
  ArrowUpRight,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import {
  OPERATORS as CALCULATOR_OPERATORS,
  CONSTANTS,
  formatCalculatorResult,
} from '@/lib/calculator'

export interface HistoryItem {
  id: string
  expression: string
  result: number | null
  error: string | null
  createdAt: string
}

interface CalculatorAppProps {
  initialHistory: HistoryItem[]
}

interface OperatorConfigEntry {
  key: string
  color: string
  ringColor: string
}

const OPERATORS_CONFIG: OperatorConfigEntry[] = [
  { key: '+', color: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700', ringColor: 'ring-emerald-500/30' },
  { key: '-', color: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700', ringColor: 'ring-rose-500/30' },
  { key: '*', color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700', ringColor: 'ring-amber-500/30' },
  { key: '/', color: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700', ringColor: 'ring-violet-500/30' },
  { key: '**', color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700', ringColor: 'ring-orange-500/30' },
  { key: '%', color: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700', ringColor: 'ring-teal-500/30' },
  { key: 'sqrt', color: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700', ringColor: 'ring-indigo-500/30' },
  { key: 'abs', color: 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700', ringColor: 'ring-pink-500/30' },
] as const

export default function CalculatorApp({ initialHistory }: CalculatorAppProps) {
  const { theme, setTheme } = useTheme()
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const inputRef = useRef<HTMLInputElement>(null)

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => [item, ...prev])
  }, [])

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id))
        toast.success('Запись удалена')
      }
    } catch {
      toast.error('Не удалось удалить запись')
    }
  }

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
      const formatted = formatCalculatorResult(item.result)
      setExpression(formatted)
      setResult(null)
      setError(null)
      toast.success('Результат скопирован')
    }
  }

  const handleClear = useCallback(() => {
    setExpression('')
    setResult(null)
    setError(null)
  }, [])

  const handleCalculate = useCallback(async () => {
    if (!expression.trim()) {
      setError('Введите выражение')
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
        body: JSON.stringify({ expression }),
      })
      const data = await res.json()

      if (data.success) {
        const formatted = formatCalculatorResult(data.result)
        setResult(formatted)
        setLastResult(formatted)
        addToHistory({
          id: data.id,
          expression: data.expression,
          result: data.result,
          error: null,
          createdAt: new Date().toISOString(),
        })
      } else {
        setError(data.error || 'Ошибка вычисления')
        addToHistory({
          id: data.id,
          expression,
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
  }, [expression, addToHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleCalculate()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
        return
      }

      if (document.activeElement !== inputRef.current && /[\d\+\-\*\/\^\%\(\)\.]/.test(e.key)) {
         inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCalculate, handleClear])

  const appendToExpression = (val: string) => {
    setExpression(prev => prev + val)
    setResult(null)
    inputRef.current?.focus()
  }

  const handleUseLastResult = () => {
    if (lastResult) {
      setExpression(lastResult)
      setResult(null)
    }
  }

  const handleConstant = (value: number) => {
    appendToExpression(formatCalculatorResult(value))
  }

  const handleOperator = (key: string) => {
    const op = CALCULATOR_OPERATORS[key]
    if (!op) return

    if (op.isFunction) {
      appendToExpression(`${op.symbol}(`)
    } else {
      appendToExpression(` ${op.symbol} `)
    }
  }

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
              <p className="text-xs text-muted-foreground">Complex Expressions Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
              Pro Edition
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
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    Результат:
                  </p>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-50 border-0">
                    Custom Parser
                  </Badge>
                </div>

                <div className="min-h-[3rem] flex items-center">
                  <AnimatePresence mode="wait">
                    {result !== null ? (
                      <motion.span
                        key="result"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-bold font-mono text-foreground"
                      >
                        {result}
                      </motion.span>
                    ) : lastResult && !expression ? (
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

              {/* Expression Input */}
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Выражение
                </label>
                <div className="relative">
                   <input
                    ref={inputRef}
                    type="text"
                    value={expression}
                    onChange={(e) => {
                      setExpression(e.target.value)
                      setResult(null)
                    }}
                    placeholder="Например: (2 + 2) * 5"
                    className="w-full px-4 py-4 text-xl sm:text-2xl font-mono rounded-xl border border-border/50 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => appendToExpression('(')} >(</Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => appendToExpression(')')} >)</Button>
                  </div>
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {/* Numbers & Common */}
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.', 'π'].map((n) => (
                    <Button
                      key={n}
                      variant="outline"
                      className="h-12 text-lg font-medium rounded-xl hover:bg-muted/80"
                      onClick={() => n === 'π' ? handleConstant(CONSTANTS.PI) : appendToExpression(n.toString())}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
                {/* Operators */}
                <div className="grid grid-cols-1 gap-2">
                  {OPERATORS_CONFIG.slice(0, 4).map((op) => {
                    const opDef = CALCULATOR_OPERATORS[op.key]
                    return (
                      <Button
                        key={op.key}
                        variant="secondary"
                        className={`h-12 text-xl font-bold rounded-xl ${op.color} text-white border-0 shadow-sm`}
                        onClick={() => handleOperator(op.key)}
                      >
                        {opDef?.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Scientific row */}
              <div className="flex gap-2 mb-6">
                 {OPERATORS_CONFIG.slice(4).map((op) => {
                    const opDef = CALCULATOR_OPERATORS[op.key]
                    return (
                      <Button
                        key={op.key}
                        variant="outline"
                        className="flex-1 h-10 text-sm font-semibold rounded-lg border-dashed"
                        onClick={() => handleOperator(op.key)}
                      >
                        {opDef?.label}
                      </Button>
                    )
                  })}
                  <Button variant="outline" className="flex-1 h-10 text-xs rounded-lg border-dashed" onClick={() => handleConstant(CONSTANTS.E)}>e</Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Считаю...
                      </>
                    ) : (
                      <>
                        Вычислить
                        <ChevronRight className="h-5 w-5 ml-1" />
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
                          className="h-14 px-5 rounded-xl border-2"
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Очистить всё</TooltipContent>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                    className="h-7 w-7 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <Separator className="mx-4 w-auto" />

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                  <div className="p-4 rounded-2xl bg-muted/20 mb-3">
                    <Clock className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">История пуста</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 max-h-[600px]">
                  <div className="p-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -100, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className={`group p-3 rounded-xl border transition-colors cursor-pointer ${
                            item.error
                              ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10'
                              : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                          }`}
                          onClick={() => item.result !== null && applyFromHistory(item)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                              {new Date(item.createdAt).toLocaleTimeString('ru-RU')}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {item.result !== null && (
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => deleteHistoryItem(e, item.id)}
                                className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground/70 mb-0.5 truncate max-w-full" title={item.expression}>
                            {item.expression}
                          </p>
                          <p className={`text-base font-bold font-mono ${
                            item.error ? 'text-destructive' : 'text-foreground'
                          }`}>
                            {item.error ? item.error : `= ${item.result}`}
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
        <div className="max-w-5xl mx-auto px-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          Professional Calculator · Next.js 16 + Custom Parser
        </div>
      </footer>
    </div>
  )
}
