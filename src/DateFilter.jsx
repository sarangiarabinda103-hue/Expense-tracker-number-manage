import React, { useState } from 'react'

const DateFilter = React.memo(function DateFilter({ onFilterChange, allExpenses }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleFilter = () => {
    const filteredExpenses = allExpenses.filter((expense) => {
      if (startDate && expense.date < startDate) return false
      if (endDate && expense.date > endDate) return false
      return true
    })

    onFilterChange(filteredExpenses)
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    onFilterChange(allExpenses)
  }

  return (
    <div className="date-filter">
      <h3 className="filter-title">Filter by Date</h3>
      <div className="filter-controls">
        <div className="date-input-group">
          <label htmlFor="start-date">From:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">To:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="filter-buttons">
          <button onClick={handleFilter} className="filter-btn color-blue">
            Apply Filter
          </button>
          <button onClick={handleClear} className="filter-btn color-green">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
})

export default DateFilter
