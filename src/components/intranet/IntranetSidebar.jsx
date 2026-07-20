import NavTreeItem from "./NavTreeItem";

// Placeholder navigation — structure/content to be guided later.
// Each item supports an optional `children` array (up to 7 nested levels).
const navItems = [
  { label: "Menu", to: "/menu" },
  { label: "Google Menu", to: "/googlemenu" },
  { label: "Azure Menu", to: "/azuremenu" },
  { label: "Base44 Menu", to: "/base44menu" },
  { label: "Staff Allocation", to: "/staffallocation" },
  { label: "Source Replica Setup", to: "/sourcereplicamakesetup" },
  { label: "Project 24", to: "/project24" },
  { label: "Push Entity Only", to: "/pushentityonly" },
];

export default function IntranetSidebar() {
  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto bg-white border-r border-blue-100 text-slate-700">
      <nav className="p-2">
        <ul className="flex flex-col">
          {navItems.map((item) => (
            <NavTreeItem key={item.to} item={item} level={1} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}