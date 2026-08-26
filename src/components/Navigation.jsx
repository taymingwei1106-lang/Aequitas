import { NavLink } from "react-router-dom";

const items = [
  {
    to: "/home",
    icon: "🏠",
    label: "Home",
  },
  {
    to: "/portfolio",
    icon: "📁",
    label: "Portfolio",
  },
  {
    to: "/add",
    icon: "➕",
    label: "Add",
  },
    {
  to: "/calculator",
  icon: "🧮",
  label: "Calculator",
},
  {
    to: "/settings",
    icon: "⚙️",
    label: "Settings",
  },

];

export default function Navigation() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}