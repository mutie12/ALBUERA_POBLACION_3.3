const m = require('./frontend/node_modules/react-icons/lu');
const checks = ['LuSend','LuMessageSquare','LuSearch','LuFilter','LuPenLine','LuTrash2','LuLogOut','LuUsersRound','LuBatteryCharging','LuAlertCircle','LuAlertOctagon','LuBellRing','LuBarChart2','LuXOctagon','LuScrollText','LuBellDot','LuLamp'];
let lines=[];
for (const name of checks) { lines.push(name+': '+(!!(m && m[name]) ? 'OK' : 'MISSING')); }
lines.push('ICONMAP SEND: check Icon.jsx uses Lu.LuSend in send: Lu.LuSend entry');
fs.writeFileSync('./_exports_result.txt', lines.join('\n'), 'utf8');
