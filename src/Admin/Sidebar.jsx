import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdPeopleOutline,
  MdSelfImprovement,
  MdQueueMusic
} from "react-icons/md";
import { FiLogOut, FiChevronRight } from "react-icons/fi";
import logo from "../Assets/logo.jpg";
import { useAuth } from "../context/AuthContext";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: MdOutlineDashboard,
    roles: ["admin", "individual", "user"],
  },
  {
    name: "Breathing",
    path: "/meditation",
    icon: MdSelfImprovement,
    roles: ["admin", "individual", "user"],
  },
  {
    name: "Affirmations",
    path: "/affirmations",
    icon: MdQueueMusic,
    roles: ["admin", "individual", "user"],
  },
  {
    name: "Meditation Playlist",
    path: "/meditation-playlist",
    icon: MdQueueMusic,
    roles: ["admin", "individual", "user"],
  },
  {
    name: "Users",
    path: "/users",
    icon: MdPeopleOutline,
    roles: ["admin"],
  },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role || "admin")
  );

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <>
      <style>{`
        .sidebar-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          color: #66785c;
        }
        .sidebar-nav-link:hover {
          background: #eef6ea;
          color: #29401f;
        }
        .sidebar-nav-link:hover .nav-icon {
          color: #7d9667;
        }
        .sidebar-nav-link.active-link {
          background: linear-gradient(135deg, #7d9667 0%, #8faa76 100%);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(125,150,103,0.22);
        }
        .sidebar-nav-link.active-link .nav-icon {
          color: #ffffff;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #66785c;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          letter-spacing: 0.01em;
        }
        .logout-btn:hover {
          background: rgba(220,60,60,0.10);
          color: #dc6262;
        }
        .logout-btn:hover .logout-icon {
          color: #dc6262;
        }
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform: scale(1); }
          50% { opacity:0.4; transform: scale(0.7); }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        style={{
          position: "fixed",
          top: 0, left: 0,
          zIndex: 50,
          height: "100vh",
          width: 248,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #fbfdf8 0%, #f2f7ee 56%, #eef6ea 100%)",
          borderRight: "1px solid #dde8d5",
          boxShadow: "8px 0 32px rgba(80,105,67,0.10)",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'DM Sans', sans-serif",
        }}
        className="lg:translate-x-0"
      >
        {/* Dot-grid texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }}>
          <defs>
            <pattern id="sdots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#c9dac0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sdots)" />
        </svg>

        {/* Aurora glow — top right */}
        <div style={{
          position: "absolute", width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(125,150,103,0.16) 0%, transparent 65%)",
          top: -80, right: -80, pointerEvents: "none",
        }} />
        {/* Aurora glow — bottom left */}
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(138,185,205,0.12) 0%, transparent 65%)",
          bottom: -60, left: -60, pointerEvents: "none",
        }} />

        {/* ── Logo area ── */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", gap: 12,
          padding: "22px 20px 18px",
          borderBottom: "1px solid #dde8d5",
          flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: "#eef6ea",
            border: "1px solid #dbe8d3",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 8px 20px rgba(125,150,103,0.14)",
          }}>
            <img src={logo} alt="Logo" style={{
              width: 34, height: 34, borderRadius: 9,
              objectFit: "cover",
            }} />
          </div>
          <div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem", fontWeight: 600,
              color: "#1f2f18", letterSpacing: "-0.01em", lineHeight: 1.1,
            }}>
              MentalSwasthya
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 6px rgba(74,222,128,0.7)",
                animation: "dotPulse 2s ease-in-out infinite",
                display: "inline-block",
              }} />
              <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7d9667" }}>
                Live Platform
              </span>
            </div>
          </div>
        </div>

        {/* ── User profile chip ── */}
        <div style={{
          position: "relative", zIndex: 1,
          margin: "14px 14px 4px",
          padding: "12px 14px",
          borderRadius: 16,
          background: "#ffffff",
          border: "1px solid #e1eadb",
          display: "flex", alignItems: "center", gap: 11,
          flexShrink: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg, #7d9667 0%, #9bb787 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#ffffff",
            flexShrink: 0,
            boxShadow: "0 8px 18px rgba(125,150,103,0.22)",
            letterSpacing: "0.02em",
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{
              fontSize: 13, fontWeight: 600,
              color: "#22331b",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              lineHeight: 1.2, marginBottom: 3,
            }}>
              {user?.name || "Admin"}
            </p>
            <span style={{
              display: "inline-block",
              fontSize: 9.5, fontWeight: 600, letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "#7d9667",
              background: "#eef6ea",
              padding: "2px 8px", borderRadius: 99,
            }}>
              {user?.role || "admin"}
            </span>
          </div>
        </div>

        {/* ── Section label ── */}
        <p style={{
          position: "relative", zIndex: 1,
          padding: "16px 20px 8px",
          fontSize: 9.5, fontWeight: 700,
          letterSpacing: "0.20em", textTransform: "uppercase",
          color: "#98a98e",
          flexShrink: 0,
        }}>
          Main Menu
        </p>

        {/* ── Navigation ── */}
        <nav style={{
          flex: 1, overflowY: "auto",
          padding: "0 10px 12px",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {filteredMenu.map(({ name, path, icon: Icon }, idx) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              style={{ animationDelay: `${idx * 0.06}s` }}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? " active-link" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left accent */}
                  {isActive && (
                    <span style={{
                      position: "absolute", left: 0,
                      top: "50%", transform: "translateY(-50%)",
                      width: 3, height: 20, borderRadius: "0 3px 3px 0",
                      background: "#ffffff",
                    }} />
                  )}

                  <Icon
                    className="nav-icon"
                    style={{
                      fontSize: 20, flexShrink: 0,
                      color: isActive ? "#ffffff" : "#8a9a80",
                      transition: "color 0.2s",
                    }}
                  />

                  <span style={{ flex: 1 }}>{name}</span>

                  {isActive && (
                    <FiChevronRight style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Divider ── */}
        <div style={{
          position: "relative", zIndex: 1,
          height: 1, margin: "0 14px",
          background: "#dde8d5",
          flexShrink: 0,
        }} />

        {/* ── Logout ── */}
        <div style={{
          position: "relative", zIndex: 1,
          padding: "10px 10px 18px",
          flexShrink: 0,
        }}>
          <button onClick={logout} className="logout-btn">
            <FiLogOut
              className="logout-icon"
              style={{ fontSize: 16, color: "#8a9a80", transition: "color 0.2s" }}
            />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(31,47,24,0.34)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
            transition: "opacity 0.3s",
          }}
          className="lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
