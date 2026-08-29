import { useState } from "react";

import DndResourceSearch from "../components/DndResourceSearch";
import DndDetailPanel from "../components/DndDetailPanel";

const RESOURCE_TYPES = [
  "monsters",
  "spells",
  "equipment",
  "magic-items",
  "conditions",
  "classes",
  "races",
];

function Compendium() {
  const [resourceType, setResourceType] = useState("monsters");
  const [selectedDetail, setSelectedDetail] = useState(null);

  function handleResourceChange(event) {
    setResourceType(event.target.value);
    setSelectedDetail(null);
  }

  return (
    <main>
      <div className="page-header">
        <h1>Compendium</h1>
        <p>Search the D&D 5e reference data for monsters, spells, equipment, and more.</p>
      </div>

      <label>Resource Type</label>

      <select value={resourceType} onChange={handleResourceChange}>
        {RESOURCE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <DndResourceSearch
        key={resourceType}
        resource={resourceType}
        onSelect={setSelectedDetail}
      />

      <DndDetailPanel detail={selectedDetail} />
    </main>
  );
}

export default Compendium;
