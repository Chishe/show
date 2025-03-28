import { IoMdHome } from "react-icons/io";
import { BsDatabaseCheck } from "react-icons/bs";
import { AiFillTruck, AiTwotoneSafetyCertificate } from "react-icons/ai";
import { GiMoneyStack } from "react-icons/gi";
import { MdInventory } from "react-icons/md";
import { FaWatchmanMonitoring, FaPeopleGroup } from "react-icons/fa6";
import { CiSettings } from "react-icons/ci";
import { GrStatusUnknown } from "react-icons/gr";

const separator = <div className="w-[2px] bg-white h-10 ml-2"></div>;

export const menuItems = [
  { icon: <IoMdHome size={18} />, label: "Production", link: "/production" },
  { icon: <BsDatabaseCheck size={18} />, label: "Quality", link: "/quality" },
  { icon: separator, label: "Quality Form", link: "/quality-form" },
  { icon: <AiFillTruck size={18} />, label: "Delivery", link: "/delivery" },
  { icon: <GiMoneyStack size={18} />, label: "Cost", link: "/cost" },
  { icon: <AiTwotoneSafetyCertificate size={18} />, label: "Safety", link: "/safety" },
  { icon: <MdInventory size={18} />, label: "Inventory", link: "/inventory" },
  {
    icon: <GrStatusUnknown size={18} />,
    label: "Dekidaka & Loss Monitoring",
    link: "https://www.tsdmcd.com/dekidaka",
  },
  { icon: separator, label: "Production Plan", link: "/production-plan" },
  { icon: separator, label: "Part Dimension", link: "/part-dimension" },
  { icon: separator, label: "Machine Status", link: "/machine-status" },
  { icon: separator, label: "Fluctuation Dekidaka", link: "/fluctuation-dekidaka" },
  { icon: <FaPeopleGroup size={18} />, label: "Manpower", link: "/manpower" },
  { icon: <CiSettings size={18} />, label: "System Setting", link: "/system-setting" },
  { icon: <FaWatchmanMonitoring size={18} />, label: "Production Status", link: "/production-status" },
  { icon: separator, label: "Quality KPI Dashboard", link: "/quality-kpi-dashboard" },
  { icon: separator, label: "Cost KPI Dashboard", link: "/cost-kpi-dashboard" },
  { icon: separator, label: "Delivery KPI Dashboard", link: "/delivery-kpi-dashboard" },
  { icon: separator, label: "Safety KPI Dashboard", link: "/safety-kpi-dashboard" },
];
