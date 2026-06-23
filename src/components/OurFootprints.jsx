import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import ActionButton from "./ActionButton.jsx";
import SectionCard from "./SectionCard.jsx";

export const cityCoordinates = {
  "Los Angeles, CA": { x: 142, y: 333 },
  "San Francisco, CA": { x: 120, y: 244 },
  "New York, NY": { x: 805, y: 210 },
  "New Haven, CT": { x: 818, y: 194 },
  "Boston, MA": { x: 846, y: 174 },
  "Houston, TX": { x: 477, y: 432 },
  "Dallas, TX": { x: 454, y: 374 },
  "Chicago, IL": { x: 612, y: 232 },
  "Seattle, WA": { x: 151, y: 108 },
  "Washington, DC": { x: 765, y: 272 },
  "Philadelphia, PA": { x: 789, y: 238 },
  "Miami, FL": { x: 742, y: 493 },
  "Las Vegas, NV": { x: 221, y: 303 },
  "Phoenix, AZ": { x: 268, y: 363 },
  "Denver, CO": { x: 381, y: 279 },
  "Atlanta, GA": { x: 671, y: 371 },
};

const emptyForm = {
  city: "",
  state: "",
  dateVisited: "",
  note: "",
};

function getCoordinate(footprint) {
  return cityCoordinates[footprint.label || `${footprint.city}, ${footprint.state}`];
}

function FootprintForm({ onCancel, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="surface-row rounded-[24px] p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_0.55fr_0.8fr]">
        <input
          value={form.city}
          placeholder="City"
          onChange={(event) => updateField("city", event.target.value)}
          className="rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-primary/55 focus:ring-4 focus:ring-primary/10"
        />
        <input
          value={form.state}
          placeholder="State"
          maxLength={2}
          onChange={(event) => updateField("state", event.target.value.toUpperCase())}
          className="rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm uppercase outline-none transition focus:border-primary/55 focus:ring-4 focus:ring-primary/10"
        />
        <input
          type="date"
          value={form.dateVisited}
          onChange={(event) => updateField("dateVisited", event.target.value)}
          className="rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-primary/55 focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <textarea
        value={form.note}
        rows={3}
        placeholder="Little memory from this place"
        onChange={(event) => updateField("note", event.target.value)}
        className="mt-3 w-full resize-y rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary/55 focus:ring-4 focus:ring-primary/10"
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <ActionButton icon={X} onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </ActionButton>
        <ActionButton
          icon={Plus}
          variant="primary"
          onClick={() => onSave(form)}
          className="w-full sm:w-auto"
        >
          Save City
        </ActionButton>
      </div>
    </div>
  );
}

export default function OurFootprints() {
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const mappedFootprints = useMemo(
    () => dashboardData.footprints.filter((item) => getCoordinate(item)),
    [dashboardData.footprints],
  );

  const addFootprint = (form) => {
    if (!currentUser || !form.city.trim() || !form.state.trim()) return;

    const city = form.city.trim();
    const state = form.state.trim().toUpperCase();
    const label = `${city}, ${state}`;

    setDashboardData((data) => {
      data.footprints.push({
        id: createId("footprint"),
        kind: "footprint",
        city,
        state,
        label,
        note: form.note.trim(),
        dateVisited: form.dateVisited,
        ownerId: currentUser.id,
        addedBy: currentUser.name,
        visibility: "shared",
      });
      return data;
    });
    setIsAdding(false);
  };

  const deleteFootprint = (index) => {
    setDashboardData((data) => {
      data.footprints.splice(index, 1);
      return data;
    });
  };

  return (
    <SectionCard
      id="footprints"
      title="Our Footprints"
      description="Places we’ve been together, mapped with little memories."
      actionLabel="Add City"
      actionIcon={Plus}
      actionOnClick={() => setIsAdding(true)}
    >
      <div className="grid gap-5">
        {isAdding ? (
          <FootprintForm onCancel={() => setIsAdding(false)} onSave={addFootprint} />
        ) : null}

        <div className="footprint-map-card">
          <svg
            viewBox="0 0 960 560"
            role="img"
            aria-label="United States footprint map"
            className="h-auto w-full"
          >
            <path
              className="us-map-shape"
              d="M122 156 167 107 244 91 328 115 398 113 477 132 562 112 651 142 733 133 833 181 858 246 816 304 790 376 740 450 652 463 575 428 493 457 412 425 327 437 247 397 202 335 141 296 104 225Z"
            />
            <path
              className="us-map-shape subtle"
              d="M396 426 455 472 528 478 579 454 493 457Z"
            />
            <path
              className="us-map-line"
              d="M168 110 245 397M328 116 326 437M477 132 493 457M651 142 652 463M733 133 740 450"
            />

            {mappedFootprints.map((footprint) => {
              const coordinate = getCoordinate(footprint);
              const labelOffset = coordinate.x > 700 ? -118 : 18;
              const labelX = coordinate.x + labelOffset;
              const labelY = coordinate.y - 26;

              return (
                <g key={footprint.id} className="map-marker-group">
                  <line
                    x1={coordinate.x}
                    y1={coordinate.y}
                    x2={labelX + (labelOffset < 0 ? 108 : 0)}
                    y2={labelY + 18}
                    className="map-label-line"
                  />
                  <circle
                    cx={coordinate.x}
                    cy={coordinate.y}
                    r="16"
                    className="map-marker-glow"
                  />
                  <circle
                    cx={coordinate.x}
                    cy={coordinate.y}
                    r="7"
                    className="map-marker-dot"
                  />
                  <foreignObject x={labelX} y={labelY} width="128" height="44">
                    <div className="map-city-label" title={footprint.label}>
                      <MapPin className="h-3.5 w-3.5 text-[#D9A7B0]" />
                      <span>{footprint.label}</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {dashboardData.footprints.map((footprint, index) => {
            const isMapped = Boolean(getCoordinate(footprint));

            return (
              <div key={footprint.id} className="surface-row rounded-[24px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{footprint.label}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {footprint.dateVisited || "Date not set"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete footprint"
                    title="Delete footprint"
                    onClick={() => deleteFootprint(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/75 text-muted transition hover:border-primary/35 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {footprint.note || "No note yet."}
                </p>
                {!isMapped ? (
                  <p className="mt-2 text-xs font-semibold text-[#C89AA4]">
                    Location saved, not mapped yet.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="owner-badge">Added by {footprint.addedBy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
