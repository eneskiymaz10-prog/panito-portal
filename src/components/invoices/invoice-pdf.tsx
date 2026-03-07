import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const colors = {
  primary: "#1a1a2e",
  accent: "#e94560",
  lightGray: "#f5f5f5",
  mediumGray: "#e0e0e0",
  darkGray: "#555555",
  text: "#333333",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  companySection: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: 6,
  },
  companyAddress: {
    fontSize: 9,
    color: colors.darkGray,
    lineHeight: 1.5,
  },
  invoiceTitleSection: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    marginBottom: 4,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoBlock: {
    flexDirection: "column",
    width: "48%",
  },
  infoBlockRight: {
    flexDirection: "column",
    width: "48%",
    alignItems: "flex-end",
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  infoValueBold: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 2,
  },

  // Dates
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginBottom: 4,
  },
  dateItem: {
    flexDirection: "row",
    gap: 6,
  },
  dateLabel: {
    fontSize: 9,
    color: colors.darkGray,
  },
  dateValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },

  // Table
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  colProduct: {
    width: "40%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colUnitPrice: {
    width: "20%",
    textAlign: "right",
  },
  colLineTotal: {
    width: "25%",
    textAlign: "right",
  },
  tableCellText: {
    fontSize: 10,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },

  // Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  totalsBox: {
    width: "45%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  totalsRowBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginTop: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: colors.darkGray,
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  totalsFinalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  footerText: {
    fontSize: 8,
    color: colors.darkGray,
  },
});

export interface InvoiceItem {
  product_name: string;
  quantity_masterboxes: number;
  unit_price: number;
  line_total: number;
}

export interface InvoiceData {
  invoice_number: string;
  created_at: string;
  due_date: string | null;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  customer: {
    company_name: string | null;
    country: string | null;
    address: string | null;
  };
  items: InvoiceItem[];
}

function formatCurrencyPdf(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDatePdf(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export const InvoicePdfDocument: React.FC<{ data: InvoiceData }> = ({
  data,
}) => {
  const {
    invoice_number,
    created_at,
    due_date,
    currency,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    customer,
    items,
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>PANITO</Text>
            <Text style={styles.companyAddress}>
              Panito Food B.V.{"\n"}
              Amsterdam, Netherlands{"\n"}
              info@panito.com
            </Text>
          </View>
          <View style={styles.invoiceTitleSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice_number}</Text>
          </View>
        </View>

        {/* Customer Info and Dates */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoValueBold}>
              {customer.company_name || "N/A"}
            </Text>
            {customer.address && (
              <Text style={styles.infoValue}>{customer.address}</Text>
            )}
            {customer.country && (
              <Text style={styles.infoValue}>{customer.country}</Text>
            )}
          </View>
          <View style={styles.infoBlockRight}>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Invoice Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDatePdf(created_at)}
                </Text>
              </View>
            </View>
            {due_date && (
              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Due Date:</Text>
                  <Text style={styles.dateValue}>
                    {formatDatePdf(due_date)}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Currency:</Text>
                <Text style={styles.dateValue}>{currency}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colProduct]}>
              Product
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              Qty (Masterboxes)
            </Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.colLineTotal]}>
              Line Total
            </Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View
              key={index}
              style={index % 2 === 1 ? styles.tableRowAlt : styles.tableRow}
            >
              <Text style={[styles.tableCellBold, styles.colProduct]}>
                {item.product_name}
              </Text>
              <Text style={[styles.tableCellText, styles.colQuantity]}>
                {item.quantity_masterboxes}
              </Text>
              <Text style={[styles.tableCellText, styles.colUnitPrice]}>
                {formatCurrencyPdf(item.unit_price, currency)}
              </Text>
              <Text style={[styles.tableCellBold, styles.colLineTotal]}>
                {formatCurrencyPdf(item.line_total, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRowBorder}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrencyPdf(subtotal, currency)}
              </Text>
            </View>
            <View style={styles.totalsRowBorder}>
              <Text style={styles.totalsLabel}>
                Tax ({(tax_rate * 100).toFixed(0)}%)
              </Text>
              <Text style={styles.totalsValue}>
                {formatCurrencyPdf(tax_amount, currency)}
              </Text>
            </View>
            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>Total</Text>
              <Text style={styles.totalsFinalValue}>
                {formatCurrencyPdf(total, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business. Payment is due by the date specified
            above.
          </Text>
          <Text style={styles.footerText}>
            Panito Food B.V. — Amsterdam, Netherlands
          </Text>
        </View>
      </Page>
    </Document>
  );
};
