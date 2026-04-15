import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

import './App.css'
import Spinner from './Spinner'
import { ThemeProvider } from './ThemeContext'
import { useTheme } from './useTheme'

// Lazy load ALL components to reduce initial bundle size
const ExpenseForm = lazy(() => import('./ExpenseForm'))
const ExpenseList = lazy(() => import('./ExpenseList'))
const DateFilter = lazy(() => import('./DateFilter'))
const MonthlyReportPage = lazy(() => import('./MonthlyReportPage'))

function getMonthlyBreakdown(data) {
  const months = {}
  data.forEach((expense) => {
    const date = new Date(expense.date)
    if (Number.isNaN(date)) return
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!months[monthKey]) {
      months[monthKey] = { name: monthName, total: 0, count: 0, year, month, monthKey }
    }
    months[monthKey].total += Number(expense.amount || 0)
    months[monthKey].count += 1
  })
  return Object.values(months).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
}

function AppContent() {
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()
  
  // Memoize expensive localStorage operations
  const [expenses, setExpenses] = useState(() => {
    const stored = localStorage.getItem('expenses')
    if (!stored) return []
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  })

  const [filteredExpenses, setFilteredExpenses] = useState(expenses)

  // Memoize expensive operations
  const monthlyData = useMemo(() => getMonthlyBreakdown(filteredExpenses), [filteredExpenses])
  const totalExpense = useMemo(() => filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0), [filteredExpenses])
  const currentMonthTotal = useMemo(() => monthlyData[0]?.total || 0, [monthlyData])

  const saveToLocalStorage = useCallback((expenses) => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses))
    } catch (error) {
      console.error('Failed to save expenses to localStorage:', error)
    }
  }, [])

  useEffect(() => {
    saveToLocalStorage(expenses)
  }, [expenses, saveToLocalStorage])

  const handleFilter = useCallback((filtered) => {
    setFilteredExpenses(filtered)
  }, [])

  const handleMonthClick = useCallback((monthData) => {
    navigate('/monthly-report', { state: { monthData } })
  }, [navigate])

  const addExpense = useCallback((newExpense) => {
    const expenseWithDate = {
      ...newExpense,
      date: new Date().toISOString().split('T')[0]
    }
    const updated = [expenseWithDate, ...expenses]
    // Add new expense without filtering to preserve all data
    setExpenses(updated)
    setFilteredExpenses(updated)
  }, [expenses])

  const deleteExpense = useCallback((id) => {
    const updated = expenses.filter((expense) => expense.id !== id)
    setExpenses(updated)
    setFilteredExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }, [expenses])

  return (
    <Routes>
      <Route path="/" element={
        <div className="page-shell">
          <header className="app-header">
            <div className="brand-wrap">
              <img 
              src="/expense png.png" 
              alt="Expense Tracker Logo" 
              className="brand-mark" 
              loading="lazy"
              decoding="async"
            />
              <div>
                <p className="brand-title">Expense Tracker</p>
                <p className="brand-subtitle">Track your spending.</p>
              </div>
            </div>
            <nav className="app-nav">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title="Toggle dark/light mode"
                aria-label="Toggle theme"
              >
                🌙/☀️
              </button>
            </nav>
          </header>

          <main className="app-container">
            <section className="hero-card">
              <div>
                <h1>Track your <span className="color-blue">expenses</span> easily.</h1>
                <p className="hero-copy">
                  Add spending, view totals, keep records.
                </p>
              </div>
              <div className="hero-stats">
                <div className="stat-card color-green">
                  <p className="stat-label">This month</p>
                  <p className="stat-value">Rs{currentMonthTotal.toFixed(2)}</p>
                </div>
                <div className="stat-card color-blue">
                  <p className="stat-label">Total (6 months)</p>
                  <p className="stat-value">Rs{totalExpense.toFixed(2)}</p>
                </div>
              </div>
            </section>

            <section id="add">
              <Suspense fallback={<Spinner />}>
                <ExpenseForm onAddExpense={addExpense} />
              </Suspense>
            </section>

            <section id="filter">
              <Suspense fallback={<Spinner />}>
                <DateFilter onFilterChange={handleFilter} allExpenses={expenses} />
              </Suspense>
            </section>

            <section id="report" className="reports-section">
              <h2 className="reports-title">Monthly <span className="color-green">Reports</span> <span className="color-yellow">(Last 6 Months)</span></h2>
              <div className="monthly-grid">
                {monthlyData.length > 0 ? (
                  monthlyData.map((month, idx) => (
                    <div 
                      key={idx} 
                      className={`monthly-card ${idx % 2 === 0 ? 'color-blue' : 'color-green'} clickable`}
                      onClick={() => handleMonthClick(month)}
                    >
                      <p className="month-name">{month.name}</p>
                      <p className="month-total">Rs{month.total.toFixed(2)}</p>
                      <p className="month-count">{month.count} expenses</p>
                      <p className="click-hint">Click for details</p>
                    </div>
                  ))
                ) : (
                  <div className="no-reports">
                    <p>No expenses yet. Add some expenses to see monthly reports!</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="list-title">Your <span className="color-blue">Expenses</span> <span className="color-yellow">({filteredExpenses.length} items)</span></h3>
              <p className="list-subtitle">Showing filtered expenses</p>
              <Suspense fallback={<Spinner />}>
                <ExpenseList expenses={filteredExpenses} onDeleteExpense={deleteExpense} />
              </Suspense>
            </section>
          </main>

          <footer className="app-footer" id="footer">
            <p className="footer-message">Start <span className="color-green">adding</span> your <span className="color-blue">expenses</span> <span className="color-yellow">today</span>!</p>
            <p className="footer-bottom">© {new Date().getFullYear()} Expense Tracker</p>
          </footer>
        </div>
      } />
      <Route path="/monthly-report" element={
        <Suspense fallback={<Spinner />}>
          <MonthlyReportPage />
        </Suspense>
      } />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
