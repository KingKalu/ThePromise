const branches = [
  { id: "lagos", name: "Lagos Mainland", timezone: "Africa/Lagos" },
  { id: "abuja", name: "Abuja Central", timezone: "Africa/Lagos" },
  { id: "ph", name: "Port Harcourt", timezone: "Africa/Lagos" },
];

const menu = [
  { id: "jollof", name: "Jollof Rice", price: 3500, category: "Meals" },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken",
    price: 4800,
    category: "Protein",
  },
  { id: "suya", name: "Suya Platter", price: 4200, category: "Meals" },
  { id: "salad", name: "Garden Salad", price: 2800, category: "Sides" },
  {
    id: "smoothie",
    name: "Tropical Smoothie",
    price: 1900,
    category: "Drinks",
  },
  {
    id: "waffles",
    name: "Buttermilk Waffles",
    price: 2600,
    category: "Dessert",
  },
];

const STATUS_STEPS = ["Received", "In Kitchen", "Ready", "Served"];
const AUTO_STEP_MS = 4000;

function getStore() {
  if (!globalThis.__promiseStore) {
    globalThis.__promiseStore = { orders: [] };
  }
  return globalThis.__promiseStore;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function uid() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateOrderNumber(branchId) {
  return `PROM-${todayStr()}-${branchId.toUpperCase()}-${uid()}`;
}

function normalizeStepIndex(index) {
  return Math.max(0, Math.min(index, STATUS_STEPS.length - 1));
}

function getComputedStepIndex(order) {
  if (typeof order.manualStepIndex === "number") {
    return normalizeStepIndex(order.manualStepIndex);
  }
  const createdAtMs = Date.parse(order.createdAt);
  if (!Number.isFinite(createdAtMs)) return 0;
  const elapsedMs = Math.max(0, Date.now() - createdAtMs);
  return normalizeStepIndex(Math.floor(elapsedMs / AUTO_STEP_MS));
}

function toHydratedOrder(order) {
  const stepIndex = getComputedStepIndex(order);
  return {
    ...order,
    stepIndex,
    status: STATUS_STEPS[stepIndex],
  };
}

function aggregateAnalytics() {
  const orders = listOrders();
  const byBranch = {};
  const hourly = {};
  const itemAgg = {};
  const customers = {};
  let dineIn = 0;
  let takeaway = 0;
  let basketTotal = 0;

  for (const o of orders) {
    byBranch[o.branchId] = (byBranch[o.branchId] || 0) + o.total;

    const hour = new Date(o.createdAt).getHours();
    hourly[hour] = (hourly[hour] || 0) + o.total;

    for (const it of o.items) {
      itemAgg[o.branchId] = itemAgg[o.branchId] || {};
      itemAgg[o.branchId][it.id] = (itemAgg[o.branchId][it.id] || 0) + it.qty;
    }

    customers[o.customerId] = (customers[o.customerId] || 0) + 1;

    if (o.mode === "dine-in") dineIn += 1;
    else takeaway += 1;
    basketTotal += o.total;
  }

  const bestByBranch = {};
  for (const [branchId, items] of Object.entries(itemAgg)) {
    let bestId = null;
    let bestQty = 0;
    for (const [itemId, qty] of Object.entries(items)) {
      if (qty > bestQty) {
        bestQty = qty;
        bestId = itemId;
      }
    }
    const menuItem = menu.find((m) => m.id === bestId);
    bestByBranch[branchId] = menuItem
      ? { id: menuItem.id, name: menuItem.name, qty: bestQty }
      : null;
  }

  const repeatCustomers = Object.values(customers).filter((v) => v > 1).length;
  const orderCount = orders.length || 1;

  return {
    branchTotals: byBranch,
    hourlyRevenue: hourly,
    bestSellers: bestByBranch,
    behavior: {
      dineIn,
      takeaway,
      avgBasket: basketTotal / orderCount,
      repeatCustomers,
    },
  };
}

export function listBranches() {
  return branches;
}

export function listMenu() {
  return menu;
}

export function listOrders(branchId) {
  const { orders } = getStore();
  const hydrated = orders.map(toHydratedOrder);
  if (!branchId) return hydrated;
  return hydrated.filter((order) => order.branchId === branchId);
}

export function createOrder(payload) {
  const { branchId, mode, tableCode, items, customerName } = payload || {};
  if (!branchId || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid order payload");
  }

  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const order = {
    id: uid(),
    orderNumber: generateOrderNumber(branchId),
    branchId,
    mode: mode || "dine-in",
    tableCode: tableCode || null,
    items,
    total,
    totalFormatted: formatCurrency(total),
    customerName: customerName || "Guest",
    customerId: customerName || "guest",
    paymentStatus: "Paid",
    createdAt: new Date().toISOString(),
    manualStepIndex: 0,
  };

  const { orders } = getStore();
  orders.push(order);
  return toHydratedOrder(order);
}

export function updateOrderStatus(id, status) {
  const nextStep = STATUS_STEPS.indexOf(status);
  if (nextStep < 0) {
    throw new Error("Invalid status");
  }

  const { orders } = getStore();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;

  order.manualStepIndex = nextStep;
  return toHydratedOrder(order);
}

export function getOverviewAnalytics() {
  return aggregateAnalytics();
}

export function getChatReply(payload) {
  const { role, message, branchId, page } = payload || {};
  if (!message || typeof message !== "string") {
    throw new Error("Message is required");
  }

  const trimmed = message.toLowerCase();
  let reply;
  if (trimmed.includes("menu") || trimmed.includes("food")) {
    reply =
      "Here is a quick view of today's menu highlights: Jollof Rice, Grilled Chicken, Suya Platter, Garden Salad, Tropical Smoothie and Buttermilk Waffles. You can tap items in the menu panel to add them to your order.";
  } else if (trimmed.includes("open") || trimmed.includes("time")) {
    reply =
      "Branches typically operate from 11:00 to 23:00. For exact hours, please confirm with the specific branch; this demo focuses on the digital ordering and analytics experience.";
  } else if (trimmed.includes("order") && trimmed.includes("status")) {
    reply =
      'You can see live order status in the Ordering page under "Real-Time Order Status", and in the Kitchen dashboard where staff advance orders from Received to Served.';
  } else if (trimmed.includes("analytics") || trimmed.includes("report")) {
    reply =
      "The Head Office dashboard compares branch revenue, visualizes peak hours, tracks best-selling items per branch and summarizes customer behavior such as dine-in vs takeaway and repeat customers.";
  } else if (role === "staff") {
    reply =
      "As branch staff you can use the Kitchen dashboard to view incoming orders, update their status and monitor daily performance metrics for your location.";
  } else if (role === "admin") {
    reply =
      "As head-office, use the analytics dashboard to compare branches, monitor hourly performance and understand product and customer trends across your restaurant estate.";
  } else {
    reply =
      "I can help you navigate The Promise platform. You can ask about placing an order, viewing your order status, understanding how branches are compared, or what analytics are available.";
  }

  return {
    reply,
    role: "assistant",
    branchId: branchId || null,
    page: page || null,
  };
}
