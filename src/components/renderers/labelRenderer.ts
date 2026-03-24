import type { ICellRendererParams } from "ag-grid-enterprise";

export const labelRenderer = (
  hasChildren: (id: string | number) => boolean,
  isExpanded: (id: string | number) => boolean,
  toggleRow: (id: string | number) => void,
  refreshGrid: () => void,
) => {
  return (params: ICellRendererParams) => {
    if (!params.data) return "";

    const level = params.data.__level || 0;
    const hasChildrenFlag = hasChildren(params.data.id);
    const expanded = isExpanded(params.data.id);

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.paddingLeft = `${level * 20}px`;

    if (hasChildrenFlag) {
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = expanded ? "▼" : "▶";
      toggleBtn.style.marginRight = "8px";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.style.background = "none";
      toggleBtn.style.border = "none";
      toggleBtn.style.fontSize = "12px";
      toggleBtn.style.width = "20px";
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        toggleRow(params.data.id);
        refreshGrid();
      };
      div.appendChild(toggleBtn);
    } else {
      const spacer = document.createElement("span");
      spacer.style.width = "28px";
      spacer.style.display = "inline-block";
      div.appendChild(spacer);
    }

    const label = document.createElement("span");
    label.textContent = params.value;
    div.appendChild(label);

    return div;
  };
};
