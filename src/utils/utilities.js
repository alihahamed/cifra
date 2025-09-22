export function calculateBaseRisk(elevation) {
  if (elevation < 5) return "High";
  else if (elevation < 10) return "Medium";
  else return "Low";
}

export function calculateCurrentRisk(baseRisk, rainfall) {
  if (rainfall > 50) {
    if (baseRisk === "High") return "Critical";
    if (baseRisk === "Medium") return "High";
    return "Medium";
  } else if (rainfall >= 20) {
    if (baseRisk === "High") return "High";
    if (baseRisk === "Medium") return "Medium";
    return "Low";
  } else {
    return "Safe";
  }
}

export function getColor(risk) {
  switch (risk) {
    case "Critical": return "#d62728"; // red
    case "High": return "#ff7f0e";    // orange
    case "Medium": return "#ffdd57";  // yellow
    case "Low":
    case "Safe": return "#2ca02c";    // green
    default: return "#888888";        // gray
  }
}