import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import html2pdf from 'html2pdf.js'

import './PDFLayout.css'
import './MonthlyReportPage.css'

function MonthlyReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const monthData = location.state?.monthData
  const [isColorMode, setIsColorMode] = useState(true)

  const getStoredExpenses = () => {
    const stored = localStorage.getItem('expenses')
    if (!stored) return []
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  const monthExpenses = useMemo(() => {
    if (!monthData) return []
    const expenses = getStoredExpenses()
    const monthStartDate = new Date(monthData.year, monthData.month, 1)
    const monthEndDate = new Date(monthData.year, monthData.month + 1, 1)

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= monthStartDate && expenseDate < monthEndDate
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [monthData])

  useEffect(() => {
    if (!monthData) {
      navigate('/', { replace: true })
    }
  }, [monthData, navigate])

  const generatePDF = async () => {
    if (!monthData) return

    try {
      const isMobile = window.innerWidth <= 768
      const pdfContainer = document.createElement('div')
      let pdfContent = '<div id="temp-pdf-content" class="a4 ' + (!isColorMode ? '' : 'black-white-mode') + '">' 
      pdfContent += '<h1 class="pdf-title">Expense Tracker</h1>'
      pdfContent += '<p class="pdf-subtitle">Monthly Report - ' + monthData.name + '</p>'
      pdfContent += '<p class="pdf-date">Generated on ' + new Date().toLocaleDateString() + '</p>'
      pdfContent += '<div class="cards">'

      pdfContent += '<div class="card">'
      pdfContent += '<div class="card-icon">💰</div>'
      pdfContent += '<div class="card-content">'
      pdfContent += '<h3>Total Expenses</h3>'
      pdfContent += '<p class="card-value">₹' + monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0).toFixed(2) + '</p>'
      pdfContent += '<p class="card-label">' + monthExpenses.length + ' transactions</p>'
      pdfContent += '</div></div>'

      pdfContent += '<div class="card">'
      pdfContent += '<div class="card-icon">📊</div>'
      pdfContent += '<div class="card-content">'
      pdfContent += '<h3>Average Expense</h3>'
      const average = monthExpenses.length > 0 ? monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) / monthExpenses.length : 0
      pdfContent += '<p class="card-value">₹' + average.toFixed(2) + '</p>'
      pdfContent += '<p class="card-label">Per transaction</p>'
      pdfContent += '</div></div>'

      pdfContent += '<div class="card">'
      pdfContent += '<div class="card-icon">📈</div>'
      pdfContent += '<div class="card-content">'
      pdfContent += '<h3>Highest Expense</h3>'
      const highest = monthExpenses.reduce((max, expense) => Number(expense.amount || 0) > Number(max.amount || 0) ? expense : max, { amount: 0, title: '' })
      pdfContent += '<p class="card-value">₹' + highest.amount.toFixed(2) + '</p>'
      pdfContent += '<p class="card-label">' + highest.title + '</p>'
      pdfContent += '</div></div>'

      pdfContent += '</div>'
      pdfContent += '<div class="pdf-section">'
      pdfContent += '<h2 class="section-title">Category Breakdown</h2>'
      pdfContent += '<table class="pdf-table">'
      pdfContent += '<thead><tr><th>Category</th><th>Count</th><th>Total</th></tr></thead>'

      const stats = {}
      monthExpenses.forEach((expense) => {
        if (!stats[expense.title]) {
          stats[expense.title] = { count: 0, total: 0 }
        }
        stats[expense.title].count += 1
        stats[expense.title].total += Number(expense.amount || 0)
      })

      const sortedStats = Object.entries(stats).sort((a, b) => b[1].total - a[1].total)
      pdfContent += '<tbody>'
      sortedStats.forEach(([category, stat]) => {
        pdfContent += '<tr>'
        pdfContent += '<td>' + category + '</td>'
        pdfContent += '<td>' + stat.count + '</td>'
        pdfContent += '<td>₹' + stat.total.toFixed(2) + '</td>'
        pdfContent += '</tr>'
      })
      pdfContent += '</tbody></table>'
      pdfContent += '</div>'

      pdfContent += '<div class="pdf-section">'
      pdfContent += '<h2 class="section-title">Daily Expenses</h2>'
      pdfContent += '<table class="pdf-table">'
      pdfContent += '<thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>'

      const dailyStats = {}
      monthExpenses.forEach((expense) => {
        if (!dailyStats[expense.date]) {
          dailyStats[expense.date] = { count: 0, total: 0, expenses: [] }
        }
        dailyStats[expense.date].count += 1
        dailyStats[expense.date].total += Number(expense.amount || 0)
        dailyStats[expense.date].expenses.push(expense)
      })

      const sortedDailyStats = Object.entries(dailyStats).sort((a, b) => new Date(b[0]) - new Date(a[0]))
      pdfContent += '<tbody>'
      sortedDailyStats.forEach(([date, dayData]) => {
        pdfContent += '<tr class="date-row">'
        pdfContent += '<td colspan="3" class="date-header">' + date + '</td>'
        pdfContent += '</tr>'
        dayData.expenses.forEach((expense) => {
          pdfContent += '<tr>'
          pdfContent += '<td>' + expense.title + '</td>'
          pdfContent += '<td>₹' + Number(expense.amount || 0).toFixed(2) + '</td>'
          pdfContent += '<td>' + expense.date + '</td>'
          pdfContent += '</tr>'
        })
      })
      pdfContent += '</tbody></table>'
      pdfContent += '</div>'
      pdfContent += '</div>'

      pdfContainer.innerHTML = pdfContent
      document.body.appendChild(pdfContainer)

      const opt = {
        margin: 0,
        filename: 'expense-report-' + monthData.monthKey + (isMobile ? '-mobile' : '') + '-' + (isColorMode ? 'color' : 'bw') + '.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: isMobile ? 1.8 : 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      const loadingDiv = document.createElement('div')
      loadingDiv.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:10px;z-index:9999;">Generating PDF...</div>'
      document.body.appendChild(loadingDiv)

      await html2pdf().from(document.getElementById('temp-pdf-content')).set(opt).save()
      document.body.removeChild(pdfContainer)
      const modal = document.querySelector('div[style*=\"position:fixed\"]')
      if (modal) modal.remove()

      if (isMobile) {
        setTimeout(() => {
          alert('PDF downloaded successfully! Check your downloads folder.')
        }, 500)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const getCategoryStats = () => {
    const stats = {}
    monthExpenses.forEach((expense) => {
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
    monthExpenses.forEach((expense) => {
      if (!dailyStats[expense.date]) {
        dailyStats[expense.date] = { count: 0, total: 0, expenses: [] }
      }
      dailyStats[expense.date].count += 1
      dailyStats[expense.date].total += Number(expense.amount || 0)
      dailyStats[expense.date].expenses.push(expense)
    })
    return Object.entries(dailyStats).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }

  if (!monthData) {
    return <div>Loading...</div>
  }

  const total = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const average = monthExpenses.length > 0 ? total / monthExpenses.length : 0
  const highest = monthExpenses.reduce((max, expense) => 
    Number(expense.amount || 0) > Number(max.amount || 0) ? expense : max, 
    { amount: 0, title: '' }
  )
  const categoryStats = getCategoryStats()
  const dailyStats = getDailyStats()

  return (
    <div className="monthly-report-page">
      <header className="report-header">
        <div className="mobile-header">
          <div className="brand-section">
            <img 
              src="/expense png.png" 
              alt="Expense Tracker Logo"  
              className="mobile-logo" 
            />
            <div className="brand-info">
              <h1>Expense Tracker</h1>
              <p>Monthly Report - {monthData.name}</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="mobile-back-btn">
            &larr; Back
          </button>
        </div>

        <div className="download-section">
          <div className="download-options">
            <div className="color-toggle">
              <label className="toggle-label">
                <input
                  type="radio"
                  name="pdf-mode"
                  checked={isColorMode}
                  onChange={() => setIsColorMode(true)}
                />
                <span className="toggle-text">Color</span>
              </label>
              <label className="toggle-label">
                <input
                  type="radio"
                  name="pdf-mode"
                  checked={!isColorMode}
                  onChange={() => setIsColorMode(false)}
                />
                <span className="toggle-text">B&W</span>
              </label>
            </div>
            <button onClick={generatePDF} className="download-pdf-btn">
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div id="monthly-report-content" className="report-content">
        <div className="pdf-header">
          <div className="pdf-brand">
            <img 
              src="/expense png.png" 
              alt="Expense Tracker Logo" 
              className="pdf-logo" 
              loading="lazy"
              decoding="async"
            />
            <div className="pdf-brand-text">
              <h2>Expense Tracker</h2>
              <p>Track your spending efficiently</p>
            </div>
          </div>
          <div className="pdf-report-info">
            <h3>Monthly Report</h3>
            <p>{monthData.name}</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-icon">??</div>
            <div className="summary-content">
              <h3>Total Expenses</h3>
              <p className="summary-total">Rs{total.toFixed(2)}</p>
              <p className="summary-count">{monthExpenses.length} transactions</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">??</div>
            <div className="summary-content">
              <h3>Average Expense</h3>
              <p className="summary-total">Rs{average.toFixed(2)}</p>
              <p className="summary-count">Per transaction</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">??</div>
            <div className="summary-content">
              <h3>Highest Expense</h3>
              <p className="summary-total">Rs{highest.amount.toFixed(2)}</p>
              <p className="summary-count">{highest.title}</p>
            </div>
          </div>
        </div>

        <div className="category-breakdown">
          <h2>Category Breakdown</h2>
          <div className="category-list">
            {categoryStats.map(([category, stats]) => (
              <div key={category} className="category-item">
                <div className="category-info">
                  <span className="category-name">{category}</span>
                  <span className="category-count">{stats.count} items</span>
                </div>
                <span className="category-total">Rs{stats.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="daily-breakdown">
          <h2>Daily Breakdown</h2>
          <div className="daily-list">
            {dailyStats.map(([date, stats]) => (
              <div key={date} className="daily-item">
                <div className="daily-header">
                  <span className="daily-date">{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <span className="daily-total">Rs{stats.total.toFixed(2)}</span>
                </div>
                <div className="daily-expenses">
                  {stats.expenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <span className="expense-title">{expense.title}</span>
                      <span className="expense-amount">Rs{Number(expense.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyReportPage
