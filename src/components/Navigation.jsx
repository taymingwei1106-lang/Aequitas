import { NavLink } from "react-router-dom";

export default function Navigation() {
  const linkStyle = ({ isActive }) => ({
    flex: 1,
    textAlign: "center",
    textDecoration: "none",
    color: isActive ? "#4F8CFF" : "#8B8B95",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
  });

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" style={linkStyle}>
        🏠
        <br />
        Home
      </NavLink>

      <NavLink to="/portfolio" style={linkStyle}>
        📁
        <br />
        Portfolio
      </NavLink>

      <NavLink to="/add" style={linkStyle}>
        ➕
        <br />
        Add
      </NavLink>

      <NavLink to="/settings" style={linkStyle}>
        ⚙️
        <br />
        Settings
      </NavLink>
    </nav>
  );
}