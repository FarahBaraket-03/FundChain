// utils/calculateBarPercentage.js
export const calculateBarPercentage = (target, amountCollected) => {
  const targetNum = parseFloat(target);
  const amountNum = parseFloat(amountCollected);
  
  if (targetNum <= 0) return 0;
  
  const percentage = (amountNum / targetNum) * 100;
  return Math.min(percentage, 100);
};