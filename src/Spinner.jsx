import React from 'react'
import './Spinner.css'

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  )
}

export default Spinner
