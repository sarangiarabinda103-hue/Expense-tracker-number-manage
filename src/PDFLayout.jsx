import React from 'react'

const PDFLayout = ({ monthData, expenses, isColorMode }) => {
  // Calculate statistics
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const average = expenses.length > 0 ? total / expenses.length : 0
  const highest = expenses.reduce((max, expense) => 
    Number(expense.amount || 0) > Number(max.amount || 0) ? expense : max, 
    { amount: 0, title: '' }
  )

  const getCategoryStats = () => {
    const stats = {}
    expenses.forEach(expense => {
      if (!stats[expense.title]) {
        stats[expense.title] = { count: 0, total: 0 }
      }
      stats[expense.title].count += 1
      stats[expense.title].total += Number(expense.amount || 0)
    })
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total)
  }

  const getDailyStats = () => {
    const dailyStats = {}
    expenses.forEach(expense => {
      if (!dailyStats[expense.date]) {
        dailyStats[expense.date] = { count: 0, total: 0, expenses: [] }
      }
      dailyStats[expense.date].count += 1
      dailyStats[expense.date].total += Number(expense.amount || 0)
      dailyStats[expense.date].expenses.push(expense)
    })
    return Object.entries(dailyStats).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }

  const categoryStats = getCategoryStats()
  const dailyStats = getDailyStats()

  return (
    <div id="pdf-content" className="a4">
      <h1 className="pdf-title">Expense Tracker</h1>
      <p className="pdf-subtitle">Monthly Report - {monthData.name}</p>
      <p className="pdf-date">Generated on {new Date().toLocaleDateString()}</p>

      <div className="cards">
        <div className="card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-value">₹{total.toFixed(2)}</p>
            <p className="card-label">{expenses.length} transactions</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Average Expense</h3>
            <p className="card-value">₹{average.toFixed(2)}</p>
            <p className="card-label">Per transaction</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Highest Expense</h3>
            <p className="card-value">₹{highest.amount.toFixed(2)}</p>
            <p className="card-label">{highest.title}</p>
          </div>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="section-title">Category Breakdown</h2>
        <div className="pdf-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(([category, stats]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{stats.count}</td>
                  <td>₹{stats.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="section-title">Daily Expenses</h2>
        <div className="pdf-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map(([date, dayData]) => (
                <React.Fragment key={date}>
                  <tr className="date-row">
                    <td colSpan="3" className="date-header">{date}</td>
                  </tr>
                  {dayData.expenses.map((expense, index) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td>₹{Number(expense.amount || 0).toFixed(2)}</td>
                      <td>{expense.date}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PDFLayout
