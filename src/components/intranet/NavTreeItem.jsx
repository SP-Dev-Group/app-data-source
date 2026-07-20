import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";

// Literal padding classes per level (Tailwind purges dynamic class names).
const PAD = ["pl-3", "pl-6", "pl-9", "pl-12", "pl-14", "pl-16", "pl-20"];
const MAX_LEVEL = 7;

export default function NavTreeItem({ item, level }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isActive = item.to && location.pathname === item.to;
  const pad = PAD[Math.min(level - 1, PAD.length - 1)];

  const handleClick = () => {
    if (hasChildren) {
      setOpen((o) => !o);
    }
    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <li className="flex flex-col">
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 w-full text-left rounded-md transition-colors text-sm pr-3 py-2 ${pad} ${
          isActive
            ? "bg-blue-50 text-blue-700 font-medium"
            : "hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-blue-500" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="truncate">{item.label}</span>
      </button>

      {hasChildren && open && level < MAX_LEVEL && (
        <ul className="flex flex-col">
          {item.children.map((child) => (
            <NavTreeItem
              key={child.to || child.label}
              item={child}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}