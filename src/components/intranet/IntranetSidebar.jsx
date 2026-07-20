import NavTreeItem from "./NavTreeItem";

// Placeholder navigation — structure/content to be guided later.
// Each item supports an optional `children` array (up to 7 nested levels).
const navItems = [
  { label: "Menu", to: "/menu" },
  {
    label: "Google Menu",
    to: "/googlemenu",
    children: [
      { label: "Google Form Template", to: "/googleformtemplate" },
      { label: "Google Sheets", to: "/googlesheetsMenu" },
      { label: "Firebase / Firestore", to: "/googlefirebase" },
      { label: "Google Cloud SQL / BigQuery", to: "/googlesql" },
      { label: "Object Storage", to: "/googleobjectstorage" },
    ],
  },
  {
    label: "Azure Menu",
    to: "/azuremenu",
    children: [
      { label: "Azure SQL Database", to: "/azuresql" },
      { label: "Cosmos DB", to: "/azurecosmosdb" },
      { label: "Blob Storage", to: "/azureblobstorage" },
      { label: "Azure Functions", to: "/azurefunctions" },
    ],
  },
  {
    label: "Base44 Menu",
    to: "/base44menu",
    children: [
      { label: "Data Source Manual", to: "/datasourcemanual" },
      { label: "Data Source Daily at 2am", to: "/datasourcedaily" },
      { label: "Data Source Refresh every 5 mins", to: "/datasourcerefresh5min" },
      { label: "Data Source Listener", to: "/datasourcelistener" },
      { label: "Entities", to: "/base44entities" },
      { label: "Backend Functions", to: "/base44functions" },
      { label: "Automations", to: "/base44automations" },
      { label: "AI Agents", to: "/base44agents" },
      { label: "Staff Allocation Manager", to: "/staffallocation" },
      { label: "Push Entity Only", to: "/pushentityonly" },
    ],
  },
  { label: "Staff Allocation", to: "/staffallocation" },
  { label: "Source Replica Setup", to: "/sourcereplicamakesetup" },
  { label: "Project 24", to: "/project24" },
  { label: "Push Entity Only", to: "/pushentityonly", done: true },
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