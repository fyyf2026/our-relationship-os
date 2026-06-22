const statusStyles = {
  Resolved: "border-[#BFE4D6] bg-[#EAF8F5] text-[#4F857F]",
  Pending: "border-[#BFD9EA] bg-[#EEF7FB] text-[#5D83A1]",
  Upcoming: "border-[#CDECE5] bg-[#F2FBF8] text-[#4F857F]",
  Locked: "border-[#C7DADB] bg-[#F3F8FA] text-[#647C7D]",
  Completed: "border-[#BFE4D6] bg-[#EAF8F5] text-[#4F857F]",
  Opened: "border-[#BFD9EA] bg-[#EEF7FB] text-[#5D83A1]",
  Shared: "border-[#CDECE5] bg-[#F2FBF8] text-[#4F857F]",
  High: "border-[#A7D8D0] bg-[#EAF8F5] text-[#3F7D76]",
  Medium: "border-[#BFD9EA] bg-[#EEF7FB] text-[#5D83A1]",
  Low: "border-[#D5EAE3] bg-[#F7FBF8] text-[#6F8585]",
  Planned: "border-[#CDECE5] bg-[#F2FBF8] text-[#4F857F]",
  "In Progress": "border-[#BFD9EA] bg-[#EEF7FB] text-[#5D83A1]",
};

export default function StatusTag({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] ?? "border-stone-200 bg-white text-muted"
      }`}
    >
      {status}
    </span>
  );
}
