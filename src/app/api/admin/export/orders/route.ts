import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../guard";
import { listOrders } from "@/lib/orders";
import { toCSV, csvNow } from "@/lib/csv";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows: (string | number)[][] = [
    ["OrderId", "Placed", "Customer", "Phone", "Email", "City", "State", "Pincode", "Items", "Subtotal", "Discount", "Shipping", "Total", "Coupon", "PaymentMethod", "PaymentStatus", "OrderStatus", "PaymentRef"],
    ...listOrders().map((o) => [
      o.orderId,
      o.createdAt,
      o.customer.fullName,
      o.customer.phone,
      o.customer.email,
      o.customer.city,
      o.customer.state,
      o.customer.pincode,
      o.lines.reduce((s, l) => s + l.qty, 0),
      o.subtotal,
      o.discount,
      o.shipping,
      o.total,
      o.coupon ?? "",
      o.paymentMethod === "cod" ? "COD" : "Online",
      o.paymentStatus,
      o.orderStatus,
      o.cashfree?.referenceId ?? "",
    ]),
  ];

  return new Response(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voltcart-orders-${csvNow()}.csv"`,
    },
  });
}