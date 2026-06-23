const statusStyles = {
  Resolved: "border-[#BFD6F0] bg-[#EDF5FF] text-[#2F4F6F]",
  Pending: "border-[#E7C2C9] bg-[#F5E3E7] text-[#8E6D78]",
  Upcoming: "border-[#BFD6F0] bg-[#F5F8FC] text-[#2F4F6F]",
  Locked: "border-[#D6DFEA] bg-[#F5F8FC] text-[#718096]",
  Completed: "border-[#BFD6F0] bg-[#EDF5FF] text-[#2F4F6F]",
  Opened: "border-[#BFD6F0] bg-[#EDF5FF] text-[#2F4F6F]",
  Shared: "border-[#E7C2C9] bg-[#F5E3E7] text-[#8E6D78]",
  High: "border-[#E7C2C9] bg-[#F5E3E7] text-[#8E6D78]",
  Medium: "border-[#BFD6F0] bg-[#EDF5FF] text-[#2F4F6F]",
  Low: "border-[#D6DFEA] bg-[#F8FBFF] text-[#718096]",
  Planned: "border-[#BFD6F0] bg-[#F5F8FC] text-[#2F4F6F]",
  "In Progress": "border-[#E7C2C9] bg-[#F5E3E7] text-[#8E6D78]",
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
