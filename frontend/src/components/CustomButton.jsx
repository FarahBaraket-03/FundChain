// components/CustomButton.jsx
import React from 'react'

const CustomButton = ({ btnType, title, handleClick, styles, disabled }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] transition-all duration-200 ${
        disabled 
          ? 'bg-[#6c757d] cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:opacity-90'
      } ${styles}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

export default CustomButton