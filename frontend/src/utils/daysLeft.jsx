// Version debug pour tester
export const daysLeft = (deadline) => {
  console.log('daysLeft called with:', deadline, 'type:', typeof deadline);
  
  try {
    if (!deadline) return 0;
    
    let timestamp;
    if (typeof deadline === 'bigint') {
      console.log('daysLeft called with:', deadline, 'type:', typeof deadline);
      timestamp = Number(deadline.toString());
      console.log('Converted BigInt to number:', timestamp);
    } else {
      timestamp = Number(deadline);
    }
    
    const deadlineDate = new Date(timestamp * 1000);
    console.log('Deadline date:', deadlineDate);
    
    const difference = deadlineDate.getTime() - Date.now();
    const remainingDays = difference / (1000 * 3600 * 24);
    
    console.log('Remaining days:', Math.ceil(remainingDays));
    return Math.max(0, Math.ceil(remainingDays));
  } catch (error) {
    console.error('Error in daysLeft:', error);
    return 0;
  }
};