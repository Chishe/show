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
  { icon: <IoMdHome size={18} />, label: "Production", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <BsDatabaseCheck size={18} />, label: "Quality", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Quality Form", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <AiFillTruck size={18} />, label: "Delivery", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <GiMoneyStack size={18} />, label: "Cost", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <AiTwotoneSafetyCertificate size={18} />, label: "Safety", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <MdInventory size={18} />, label: "Inventory", link: "https://www.tsdmcd.com/dekidaka" },
  {
    icon: <GrStatusUnknown size={18} />,
    label: "Dekidaka & Loss Monitoring",
    link: "/loss",
  },
  { icon: separator, label: "Production Plan", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Part Dimension", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Machine Status", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Fluctuation Dekidaka", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <FaPeopleGroup size={18} />, label: "Manpower", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: <CiSettings size={18} />, label: "System Setting", link: "/system-setting" },
  { icon: <FaWatchmanMonitoring size={18} />, label: "Production Status", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Quality KPI Dashboard", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Cost KPI Dashboard", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Delivery KPI Dashboard", link: "https://www.tsdmcd.com/dekidaka" },
  { icon: separator, label: "Safety KPI Dashboard", link: "https://www.tsdmcd.com/dekidaka" },
];
