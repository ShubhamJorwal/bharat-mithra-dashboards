import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineCollection,
  HiOutlineCash,
  HiOutlineSearch,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi";
import { PageHeader } from "../../components/common/PageHeader";
import { useTheme } from "../../context/ThemeContext";
import "./Shortcuts.scss";

type ShortcutAction = {
  key: string;          // single keyboard char (1..6)
  label: string;
  hint: string;
  icon: React.ReactNode;
  color: string;
  run: () => void;
};

const Shortcuts = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const isDark = theme === "darkMode";

  // The 6 actions on the wheel — verbs, not nav links.
  const actions: ShortcutAction[] = useMemo(
    () => [
      {
        key: "1",
        label: "New application",
        hint: "Create a citizen application",
        icon: <HiOutlinePlus />,
        color: "#3b82f6",
        run: () => navigate("/applications/new"),
      },
      {
        key: "2",
        label: "Add staff",
        hint: "Invite a team member",
        icon: <HiOutlineUserGroup />,
        color: "#10b981",
        run: () => navigate("/staff/new"),
      },
      {
        key: "3",
        label: "Add service",
        hint: "Catalog a new service",
        icon: <HiOutlineCollection />,
        color: "#f59e0b",
        run: () => navigate("/services/new"),
      },
      {
        key: "4",
        label: "Top up wallet",
        hint: "Add money to wallet",
        icon: <HiOutlineCash />,
        color: "#22c55e",
        run: () => navigate("/wallet"),
      },
      {
        key: "5",
        label: "Search command",
        hint: "Open the command palette",
        icon: <HiOutlineSearch />,
        color: "#a855f7",
        run: () => {
          // Focus the topbar search input — it expands the dropdown on focus
          const input = document.querySelector<HTMLInputElement>(".bm-search-input");
          input?.focus();
        },
      },
      {
        key: "6",
        label: isDark ? "Light theme" : "Dark theme",
        hint: "Toggle the app theme",
        icon: isDark ? <HiOutlineSun /> : <HiOutlineMoon />,
        color: "#ec4899",
        run: () => setTheme(isDark ? "confluence" : "darkMode"),
      },
    ],
    [navigate, setTheme, isDark]
  );

  // 1..6 keyboard hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const action = actions.find((a) => a.key === e.key);
      if (!action) return;
      e.preventDefault();
      setPressedKey(action.key);
      action.run();
      // brief visual press feedback
      window.setTimeout(() => setPressedKey(null), 180);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions]);

  const hovered = actions.find((a) => a.key === hoveredKey) || null;

  return (
    <div className="sc">
      <PageHeader
        icon={<HiOutlineLightningBolt />}
        title="Shortcuts"
        description="Quick actions you do most often. Press 1–6 on your keyboard, or click."
      />

      <div className="sc-stage">
        {/* Decorative aurora behind the wheel */}
        <span className="sc-aurora sc-aurora--1" aria-hidden />
        <span className="sc-aurora sc-aurora--2" aria-hidden />

        {/* Outer ring guide */}
        <div className="sc-ring" aria-hidden />

        {/* The wheel — rotates slowly on its own */}
        <div
          className="sc-wheel"
          onMouseLeave={() => setHoveredKey(null)}
        >
          {actions.map((a, idx) => {
            // 6 actions evenly around 360°, starting from top
            const angle = -90 + (360 / actions.length) * idx;
            const isHovered = hoveredKey === a.key;
            const isPressed = pressedKey === a.key;
            return (
              <button
                key={a.key}
                type="button"
                className={`sc-tile ${isHovered ? "is-hovered" : ""} ${isPressed ? "is-pressed" : ""}`}
                style={
                  {
                    "--tile-angle": `${angle}deg`,
                    "--tile-color": a.color,
                  } as React.CSSProperties
                }
                onMouseEnter={() => setHoveredKey(a.key)}
                onClick={() => {
                  setPressedKey(a.key);
                  a.run();
                  window.setTimeout(() => setPressedKey(null), 180);
                }}
                title={a.label}
              >
                <span className="sc-tile-glow" aria-hidden />
                <span className="sc-tile-key">{a.key}</span>
                <span className="sc-tile-icon">{a.icon}</span>
                <span className="sc-tile-label">{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center hub — previews the hovered action */}
        <div className="sc-hub" aria-live="polite">
          {hovered ? (
            <>
              <span className="sc-hub-preview" style={{ color: hovered.color }}>
                {hovered.icon}
              </span>
              <span className="sc-hub-label">{hovered.label}</span>
              <span className="sc-hub-hint">{hovered.hint}</span>
            </>
          ) : (
            <>
              <span className="sc-hub-glyph">⌘</span>
              <span className="sc-hub-label">Pick an action</span>
              <span className="sc-hub-hint">Hover or press 1–6</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shortcuts;
