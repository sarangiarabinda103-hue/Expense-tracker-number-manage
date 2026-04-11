import React from 'react'
import Expenseitem from './Expenseitem'

const ExpenseList = React.memo(function ExpenseList({ expenses, onDeleteExpense }) {
  if (expenses.length === 0) {
    return <p className="no-expense">No expenses yet. Add one to get started.</p>
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <Expenseitem key={expense.id} expense={expense} onDelete={() => onDeleteExpense(expense.id)} />
      ))}
    </div>
  )
})

export default ExpenseList
