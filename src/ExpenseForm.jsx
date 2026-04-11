import { useState, useRef, memo } from 'react'

const ExpenseForm = memo(function ExpenseForm({ onAddExpense }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const titleRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !amount) {
      alert('Please fill in all fields')
      return
    }

    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: parseFloat(amount)
    }

    onAddExpense(newExpense)
    setTitle('')
    setAmount('')
    titleRef.current?.focus()
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <input
        placeholder="Expense Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        ref={titleRef}
      />
      <input
        placeholder="Amount ₹"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit">Add Expense</button>
    </form>
  )
})

export default ExpenseForm
