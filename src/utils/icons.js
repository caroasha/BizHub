import {
  HiOutlineHome, HiOutlineChartBar, HiOutlineUsers, HiOutlineCog,
  HiOutlineShoppingCart, HiOutlineClipboardList, HiOutlineCash,
  HiOutlineCube, HiOutlineTicket, HiOutlineDesktopComputer,
  HiOutlineClock, HiOutlinePrinter, HiOutlineWrench, HiOutlineShieldCheck,
} from 'react-icons/hi';

const iconMap = {
  dashboard: HiOutlineHome,
  menu: HiOutlineClipboardList,
  orders: HiOutlineShoppingCart,
  tables: HiOutlineChartBar,
  kitchen: HiOutlineCube,
  inventory: HiOutlineCube,
  reports: HiOutlineChartBar,
  settings: HiOutlineCog,
  sales: HiOutlineCash,
  prescriptions: HiOutlineTicket,
  suppliers: HiOutlineUsers,
  purchases: HiOutlineShoppingCart,
  properties: HiOutlineHome,
  tenants: HiOutlineUsers,
  leases: HiOutlineClipboardList,
  payments: HiOutlineCash,
  maintenance: HiOutlineWrench,
  repairs: HiOutlineWrench,
  warranties: HiOutlineShieldCheck,
  computers: HiOutlineDesktopComputer,
  sessions: HiOutlineClock,
  services: HiOutlinePrinter,
  packages: HiOutlineCube,
  customers: HiOutlineUsers,
};

export const getIcon = (key) => iconMap[key] || HiOutlineHome;