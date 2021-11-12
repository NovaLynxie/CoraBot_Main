function calculateAccountAge(date) {
  const sysDate = new Date();
  const accDate = new Date(date);
  const diff = sysDate - accDate;
  const seconds = Math.floor(diff / 1000),
    minutes = Math.floor(seconds / 60),
    hours   = Math.floor(minutes / 60),
    days    = Math.floor(hours / 24),
    months  = Math.floor(days / 30),
    years   = Math.floor(days / 365);
  const lt1 = (num) => num > 1;  
  const res = (lt1(years)) ? `${years} years` : '' || (lt1(months)) ? `${months} months` : '' || (lt1(days)) ? `${days} days` : '' || (lt1(hours)) ? `${hours} hrs` : '' || (lt1(minutes)) ? `${minutes} mins` : 'less than a minute';
  return res;
};

module.exports = { calculateAccountAge };