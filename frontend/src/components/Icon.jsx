import React from "react";
import * as Icons from "react-icons/lu";

const iconMap = {
  shield: Icons.LuShield,
  ambulance: Icons.LuAmbulance,
  hospital: Icons.LuHospital,
  user: Icons.LuUser,
  check: Icons.LuCheck,
  x: Icons.LuX,
  alert: Icons.LuAlertTriangle,
  alertTriangle: Icons.LuAlertTriangle,
  location: Icons.LuMapPin,
  mapPinned: Icons.LuMapPinned,
  phone: Icons.LuPhone,
  mail: Icons.LuMail,
  send: Icons.LuSend,
  edit: Icons.LuPenLine,
  trash: Icons.LuTrash2,
  key: Icons.LuKey,
  users: Icons.LuUsers,
  clock: Icons.LuClock,
  bell: Icons.LuBell,
  bellRing: Icons.LuBellRing,
  alertCircle: Icons.LuAlertCircle,
  flame: Icons.LuFlame,
  water: Icons.LuDroplet,
  droplets: Icons.LuDroplet,
  waves: Icons.LuWaves,
  heart: Icons.LuHeart,
  car: Icons.LuCar,
  cloud: Icons.LuCloud,
  activity: Icons.LuActivity,
  checkCircle: Icons.LuCheckCircle,
  xCircle: Icons.LuXCircle,
  alertOctagon: Icons.LuAlertOctagon,
  info: Icons.LuInfo,
  copy: Icons.LuCopy,
  home: Icons.LuHome,
  menu: Icons.LuMenu,
  logout: Icons.LuLogOut,
  lock: Icons.LuLock,
  plus: Icons.LuPlus,
  search: Icons.LuSearch,
  filter: Icons.LuFilter,
  message: Icons.LuMessageSquare,
  file: Icons.LuFileText,
  fileText: Icons.LuFileText,
  settings: Icons.LuSettings,
  star: Icons.LuStar,
  eye: Icons.LuEye,
  eyeOff: Icons.LuEyeOff,
  barChart: Icons.LuBarChart2,
  barChart2: Icons.LuBarChart2,
  folder: Icons.LuFolder,
  bookmark: Icons.LuBookmark,
  refresh: Icons.LuRefreshCw,
  refreshCw: Icons.LuRefreshCw,
  xOctagon: Icons.LuXOctagon,
  siren: Icons.LuSiren,
  radio: Icons.LuRadio,
  wrench: Icons.LuWrench,
  usersRound: Icons.LuUsers,
  calendar: Icons.LuCalendar,
  battery: Icons.LuBatteryCharging,
  bolt: Icons.LuBolt,
  doorOpen: Icons.LuDoorOpen,
  inbox: Icons.LuInbox,
  clipboard: Icons.LuClipboard,
  clipboardList: Icons.LuClipboardList,
  zap: Icons.LuZap,
  scrollText: Icons.LuScrollText,
  list: Icons.LuList,
  barcode: Icons.LuBarcode,
  bellDot: Icons.LuBellDot,
  userRound: Icons.LuUsers,
  flag: Icons.LuFlag,
  loader: Icons.LuLoader,
  loader2: Icons.LuLoader2,
  fileCheck: Icons.LuFileCheck,
  scale: Icons.LuScale,
  cloudRain: Icons.LuCloudRain,
  gitFork: Icons.LuGitFork,
  fileImage: Icons.LuFileImage,
  lamp: Icons.LuLamp,
  spade: Icons.LuSpade,
  link: Icons.LuLink,
  crosshair: Icons.LuCrosshair,
  landmark: Icons.LuLandmark,
  stethoscope: Icons.LuStethoscope,
};

export function Icon({ name, size = 20, color, className = "", style = {} }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <span style={{ display: 'inline-block', width: size, height: size, ...style }} />;
  }
  return (
    <IconComponent 
      size={size} 
      color={color}
      className={className}
      style={style}
    />
  );
}

export function getIcon(name) {
  return iconMap[name] || null;
}

export const getEmergencyIconAsComponent = (type, size = 20, color) => {
  const map = {
    "Fire": { name: "flame", color: "#ef4444" },
    "Flood": { name: "waves", color: "#3b82f6" },
    "Water Supply Issue": { name: "droplets", color: "#3b82f6" },
    "Medical Emergency": { name: "heart", color: "#10b981" },
    "Vehicular Accident": { name: "car", color: "#f59e0b" },
    "Crime/Violence": { name: "shield", color: "#8b5cf6" },
    "Natural Disaster": { name: "cloud", color: "#f97316" },
    "Earthquake": { name: "activity", color: "#78716c" },
    "Typhoon": { name: "cloud", color: "#06b6d4" },
    "Landslide": { name: "activity", color: "#a16207" },
    "Infrastructure Damage": { name: "wrench", color: "#78716c" },
    "Power Outage": { name: "zap", color: "#f59e0b" },
    "Other": { name: "alertTriangle", color: "#6b7280" },
    "Emergency": { name: "siren", color: "#ef4444" },
  };
  const config = map[type] || map["Other"];
  const IconComp = iconMap[config.name];
  if (!IconComp) return <span style={{ display: 'inline-block', width: size, height: size }} />;
  return <IconComp size={size} color={color || config.color} />;
};

export const getStatusIconComponent = (status, size = 18, color) => {
  const map = {
    "Pending": { name: "clock", color: color || "#f59e0b" },
    "Responding": { name: "siren", color: color || "#ef4444" },
    "Resolved": { name: "checkCircle", color: color || "#10b981" },
    "Declined": { name: "xCircle", color: color || "#ef4444" },
  };
  const config = map[status] || { name: "info", color: color || "#6b7280" };
  const IconComp = iconMap[config.name];
  if (!IconComp) return <span style={{ display: 'inline-block', width: size, height: size }} />;
  return <IconComp size={size} color={config.color} />;
};

// Keep these returning string names for config objects (MyReports.jsx)
export function getEmergencyIcon(type) {
  const map = {
    "Fire": "flame",
    "Flood": "waves",
    "Medical Emergency": "heart",
    "Vehicular Accident": "car",
    "Crime/Violence": "shield",
    "Natural Disaster": "cloud",
    "Earthquake": "activity",
    "Typhoon": "cloud",
    "Landslide": "activity",
    "Infrastructure Damage": "wrench",
    "Power Outage": "bolt",
    "Water Supply Issue": "droplets",
    "Emergency": "siren",
    "Other": "alert"
  };
  return map[type] || "alert";
}

export function getStatusIcon(status) {
  const map = {
    "Pending": "clock",
    "Responding": "siren",
    "Resolved": "checkCircle",
    "Declined": "xCircle"
  };
  return map[status] || "info";
}

export function getRoleIcon(role) {
  const map = {
    admin: "shield",
    respondent: "ambulance",
    resident: "user"
  };
  return map[role] || "user";
}

export function getEmergencyColor(type) {
  const map = {
    "Fire": "#ef4444",
    "Flood": "#3b82f6",
    "Water Supply Issue": "#3b82f6",
    "Medical Emergency": "#10b981",
    "Vehicular Accident": "#f59e0b",
    "Crime/Violence": "#8b5cf6",
    "Natural Disaster": "#f97316",
    "Earthquake": "#78716c",
    "Typhoon": "#06b6d4",
    "Landslide": "#a16207",
    "Infrastructure Damage": "#78716c",
    "Power Outage": "#f59e0b",
    "Emergency": "#ef4444",
    "Other": "#6b7280"
  };
  return map[type] || "#6b7280";
}

export default Icon;