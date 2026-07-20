import NavTreeItem from "./NavTreeItem";

// Placeholder navigation — structure/content to be guided later.
// Each item supports an optional `children` array (up to 7 nested levels).
const navItems = [
  { label: "Menu", to: "/menu" },
  {
    label: "Google Menu",
    to: "/googlemenu",
    done: true,
    children: [
      { label: "Google Form Template", to: "/googleformtemplate" },
      { label: "Google Sheets", to: "/googlesheetsMenu", children: [
        { label: "Manual Entry Sheet ID URL", to: "/googlesheetsmanualsheetid" },
        { label: "Hard-coded Sheet ID", to: "/googlesheetshardcodeid" },
        { label: "Security: Protect Sheets", to: "/googlesheetssecurity" },
      ] },
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
    done: true,
    children: [
      { label: "Data Source Manual", to: "/datasourcemanual", done: true },
      { label: "Data Source Daily at 2am", to: "/datasourcedaily", done: true },
      { label: "Data Source Refresh every 5 mins", to: "/datasourcerefresh5min", done: true },
      { label: "Data Source Listener", to: "/datasourcelistener", done: true },
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