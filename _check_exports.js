const m = require('./frontend/node_modules/react-icons/lu');
const checks = ['LuSend','LuMessageSquare','LuSearch','LuFilter','LuPenLine','LuTrash2','LuLogOut','LuUsersRound','LuBatteryCharging','LuAlertCircle','LuAlertOctagon','LuBellRing','LuBarChart2','LuXOctagon','LuScrollText','LuBellDot'];
let ok = true;
for (const name of checks) {
  const present = !!(m && m[name]);
  console.log(name + ': ' + (present ? 'OK' : 'MISSING'));
  if (!present) ok = false;
}
console.log(ok ? 'ALL OK' : 'SOME MISSING');
