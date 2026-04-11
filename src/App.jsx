import { useState, useEffect } from 'react'

import './App.css'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'

function filterLast6Months(data) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return data.filter((expense) => new Date(expense.date) >= sixMonthsAgo)
}

function getMonthlyBreakdown(data) {
  const months = {}
  data.forEach((expense) => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!months[monthKey]) {
      months[monthKey] = { name: monthName, total: 0, count: 0 }
    }
    months[monthKey].total += Number(expense.amount || 0)
    months[monthKey].count += 1
  })
  return Object.values(months).sort().reverse()
}

function App() {
  const [expenses, setExpenses] = useState(() => {
    const stored = localStorage.getItem('expenses')
    const data = stored ? JSON.parse(stored) : []
    return filterLast6Months(data)
  })

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const addExpense = (newExpense) => {
    const expenseWithDate = {
      ...newExpense,
      date: new Date().toISOString().split('T')[0]
    }
    const updated = [expenseWithDate, ...expenses]
    setExpenses(filterLast6Months(updated))
  }

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const monthlyData = getMonthlyBreakdown(expenses)
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const currentMonthTotal = monthlyData[0]?.total || 0

  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="brand-wrap">
          <img src="/expense png.png" alt="Expense Tracker Logo" className="brand-mark" />
          <div>
            <p className="brand-title">Expense Tracker</p>
            <p className="brand-subtitle">Track your spending.</p>
          </div>
        </div>
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
              <p className="stat-value">₹{currentMonthTotal.toFixed(2)}</p>
            </div>
            <div className="stat-card color-blue">
              <p className="stat-label">Total (6 months)</p>
              <p className="stat-value">₹{totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section id="add">
          <ExpenseForm onAddExpense={addExpense} />
        </section>

        <section id="report" className="reports-section">
          <h2 className="reports-title">Monthly <span className="color-green">Reports</span> <span className="color-yellow">(Last 6 Months)</span></h2>
          <div className="monthly-grid">
            {monthlyData.length > 0 ? (
              monthlyData.map((month, idx) => (
                <div key={idx} className={`monthly-card ${idx % 2 === 0 ? 'color-blue' : 'color-green'}`}>
                  <p className="month-name">{month.name}</p>
                  <p className="month-total">₹{month.total.toFixed(2)}</p>
                  <p className="month-count">{month.count} expenses</p>
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
          <h3 className="list-title">Your <span className="color-blue">Expenses</span> <span className="color-yellow">({expenses.length} recent items)</span></h3>
          <p className="list-subtitle">Showing expenses from the last 6 months</p>
          <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
        </section>
      </main>

      <footer className="app-footer" id="footer">
        <p className="footer-message">Start <span className="color-green">adding</span> your <span className="color-blue">expenses</span> <span className="color-yellow">today</span>!</p>
        <p className="footer-bottom">© {new Date().getFullYear()} Expense Tracker</p>
      </footer>
    </div>
  )
}

export default App
