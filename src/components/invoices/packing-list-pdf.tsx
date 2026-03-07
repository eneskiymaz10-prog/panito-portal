import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { calculateFromMasterboxes } from "@/lib/utils/pallet-calculator";

const COLORS = {
  primary: "#1a1a2e",
  accent: "#e94560",
  lightGray: "#f4f4f4",
  mediumGray: "#cccccc",
  darkGray: "#555555",
  white: "#ffffff",
  black: "#000000",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.black,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: 15,
  },
  brandContainer: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 8,
    color: COLORS.darkGray,
    marginTop: 2,
    letterSpacing: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textAlign: "right",
  },
  documentSubtitle: {
    fontSize: 9,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 4,
  },

  // Info section
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  infoBlock: {
    width: "48%",
  },
  infoBlockLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 80,
    fontSize: 8,
    color: COLORS.darkGray,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },

  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.mediumGray,
  },
  tableRowEven: {
    backgroundColor: COLORS.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.black,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },

  // Column widths
  colNo: { width: "5%" },
  colProduct: { width: "30%" },
  colSku: { width: "15%" },
  colMasterboxes: { width: "15%", textAlign: "right" },
  colPallets: { width: "15%", textAlign: "right" },
  colWeight: { width: "20%", textAlign: "right" },

  // Summary section
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  summaryBox: {
    width: 250,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.mediumGray,
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  summaryLabelTotal: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  summaryValueTotal: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: COLORS.darkGray,
  },
});

export interface PackingListItem {
  productName: string;
  sku: string;
  quantityMasterboxes: number;
  masterboxesPerPallet: number;
  unitsPerMasterbox: number;
  weightPerUnitGrams: number;
}

export interface PackingListData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerCountry: string | null;
  customerAddress: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  items: PackingListItem[];
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} g`;
}

function formatPalletCount(totalPallets: number): string {
  if (Number.isInteger(totalPallets)) {
    return totalPallets.toFixed(0);
  }
  return totalPallets.toFixed(2);
}

function formatDate(date: string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export const PackingListPDF = ({ data }: { data: PackingListData }) => {
  const itemRows = data.items.map((item) => {
    const calc = calculateFromMasterboxes(
      item.quantityMasterboxes,
      item.masterboxesPerPallet,
      item.unitsPerMasterbox
    );
    const totalWeightGrams =
      calc.totalUnits * item.weightPerUnitGrams;

    return {
      ...item,
      totalPallets: calc.totalPallets,
      totalWeightGrams,
    };
  });

  const totalMasterboxes = itemRows.reduce(
    (sum, r) => sum + r.quantityMasterboxes,
    0
  );
  const totalPallets = itemRows.reduce((sum, r) => sum + r.totalPallets, 0);
  const totalWeightGrams = itemRows.reduce(
    (sum, r) => sum + r.totalWeightGrams,
    0
  );
  const totalWeightKg = totalWeightGrams / 1000;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>PANITO</Text>
            <Text style={styles.brandTagline}>
              PREMIUM FOOD PRODUCTS
            </Text>
          </View>
          <View>
            <Text style={styles.documentTitle}>PACKING LIST</Text>
            <Text style={styles.documentSubtitle}>
              {data.orderNumber}
            </Text>
          </View>
        </View>

        {/* Order & Customer Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoBlockLabel}>Order Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order No:</Text>
              <Text style={styles.infoValue}>{data.orderNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(data.orderDate)}
              </Text>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoBlockLabel}>Customer</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>
                {data.customerName}
              </Text>
            </View>
            {data.customerCountry && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country:</Text>
                <Text style={styles.infoValue}>
                  {data.customerCountry}
                </Text>
              </View>
            )}
            {data.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {data.customerAddress}
                </Text>
              </View>
            )}
            {data.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>
                  {data.customerEmail}
                </Text>
              </View>
            )}
            {data.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>
                  {data.customerPhone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>
              Product
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableHeaderCell, styles.colMasterboxes]}>
              Masterboxes
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPallets]}>
              Pallets
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colWeight]}>
              Weight
            </Text>
          </View>

          {/* Table Rows */}
          {itemRows.map((row, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.colNo]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCellBold, styles.colProduct]}>
                {row.productName}
              </Text>
              <Text style={[styles.tableCell, styles.colSku]}>{row.sku}</Text>
              <Text style={[styles.tableCell, styles.colMasterboxes]}>
                {row.quantityMasterboxes}
              </Text>
              <Text style={[styles.tableCell, styles.colPallets]}>
                {formatPalletCount(row.totalPallets)}
              </Text>
              <Text style={[styles.tableCell, styles.colWeight]}>
                {formatWeight(row.totalWeightGrams)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Masterboxes</Text>
              <Text style={styles.summaryValue}>{totalMasterboxes}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Pallets</Text>
              <Text style={styles.summaryValue}>
                {formatPalletCount(totalPallets)}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total Weight</Text>
              <Text style={styles.summaryValueTotal}>
                {totalWeightKg.toFixed(1)} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Panito - Packing List - {data.orderNumber}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
