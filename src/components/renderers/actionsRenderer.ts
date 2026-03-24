import type { ICellRendererParams } from "ag-grid-community";

export const actionsRenderer = (onDelete: (id: string | number) => void) => {
  return (params: ICellRendererParams) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "8px";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.style.background = "#dc3545";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.fontSize = "12px";

    deleteBtn.onclick = () => onDelete(params.data.id);
    div.appendChild(deleteBtn);

    return div;
  };
};
