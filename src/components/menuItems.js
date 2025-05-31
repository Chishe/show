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
  { icon: <IoMdHome size={18} />, label: "Production", link: "/" },
  { icon: <BsDatabaseCheck size={18} />, label: "Quality", link: "/" },
  { icon: separator, label: "Quality Form", link: "/" },
  { icon: <AiFillTruck size={18} />, label: "Delivery", link: "/" },
  { icon: <GiMoneyStack size={18} />, label: "Cost", link: "/" },
  { icon: <AiTwotoneSafetyCertificate size={18} />, label: "Safety", link: "/" },
  { icon: <MdInventory size={18} />, label: "Inventory", link: "/" },
  {
    icon: <GrStatusUnknown size={18} />,
    label: "Dekidaka & Loss Monitoring",
    link: "/",
  },
  { icon: separator, label: "Production Plan", link: "/" },
  { icon: separator, label: "Part Dimension", link: "/" },
  { icon: separator, label: "Machine Status", link: "/" },
  { icon: separator, label: "Fluctuation Dekidaka", link: "/" },
  { icon: <FaPeopleGroup size={18} />, label: "Manpower", link: "/" },
  { icon: <CiSettings size={18} />, label: "System Setting", link: "/system-setting" },
  { icon: <FaWatchmanMonitoring size={18} />, label: "Production Status", link: "/" },
  { icon: separator, label: "Quality KPI Dashboard", link: "/" },
  { icon: separator, label: "Cost KPI Dashboard", link: "/" },
  { icon: separator, label: "Delivery KPI Dashboard", link: "/" },
  { icon: separator, label: "Safety KPI Dashboard", link: "/" },
];
