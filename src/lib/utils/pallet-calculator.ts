export interface PalletCalculation {
  fullPallets: number;
  remainingMasterboxes: number;
  totalPallets: number;
  totalUnits: number;
}

export function calculateFromMasterboxes(
  masterboxes: number,
  masterboxesPerPallet: number,
  unitsPerMasterbox: number
): PalletCalculation {
  return {
    fullPallets: Math.floor(masterboxes / masterboxesPerPallet),
    remainingMasterboxes: masterboxes % masterboxesPerPallet,
    totalPallets: masterboxes / masterboxesPerPallet,
    totalUnits: masterboxes * unitsPerMasterbox,
  };
}

export function calculateFromPallets(
  pallets: number,
  masterboxesPerPallet: number,
  unitsPerMasterbox: number
): { masterboxes: number; totalUnits: number } {
  const masterboxes = Math.ceil(pallets * masterboxesPerPallet);
  return {
    masterboxes,
    totalUnits: masterboxes * unitsPerMasterbox,
  };
}

export function formatPallets(totalPallets: number): string {
  if (Number.isInteger(totalPallets)) {
    return `${totalPallets} pallet${totalPallets !== 1 ? "s" : ""}`;
  }
  const full = Math.floor(totalPallets);
  const fraction = totalPallets - full;
  if (full === 0) {
    return `${fraction.toFixed(2)} pallets`;
  }
  return `${full} + ${fraction.toFixed(2)} pallets`;
}
