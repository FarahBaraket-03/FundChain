// components/Loader.jsx
import React from 'react'
import { loader } from '../assets';

const Loader = ({ message }) => {
  return (
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
      <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
      <p className="mt-[20px] font-epilogue font-bold text-[20px] text-white text-center">
        {message || "Transaction is in progress"}
      </p>
      <p className="mt-[10px] font-epilogue font-normal text-[16px] text-[#808191] text-center">
        Please wait...
      </p>
    </div>
  )
}

export default Loader