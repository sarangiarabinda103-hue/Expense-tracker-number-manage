import React from 'react'

const Expenseitem = ({ expense, onDelete }) => {
  return (
    <div className="expense-item">
      <div className="expense-details">
        <span className="expense-title">{expense.title}</span>
        <span className="expense-date">#{expense.id}</span>
      </div>
      <div className="expense-actions">
        <span className="expense-amount">₹{Number(expense.amount).toFixed(2)}</span>
        <button className="delete-button" type="button" onClick={onDelete}>
          ❌
        </button>
      </div>
    </div>
  )
}

export default Expenseitem
