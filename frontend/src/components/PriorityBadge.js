import React from "react";

const badgeColors = {
  1: "#808080",  // Very Low - Gray
  2: "#3fc380",  // Low - Green
  3: "#f7ca18",  // Medium - Yellow
  4: "#fd7e14",  // High - Orange (Bootstrap Orange #fd7e14)
  5: "#dc3545",  // Very High - Red (Bootstrap Red #dc3545)
};

const priorityLabels = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

const PriorityBadge = ({ priority }) => (
  <span
    style={{
      background: badgeColors[priority] || "#888",
      color: "#222",
      borderRadius: "8px",
      padding: "2px 10px",
      fontWeight: "bold",
      fontSize: "0.95em",
      display: "inline-block",
      minWidth: 70,
      textAlign: "center",
    }}
  >
    {priorityLabels[priority] || priority}
  </span>
);

export default PriorityBadge;