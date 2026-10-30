import {
  UserProfile,
  Wallet,
  Category,
  Transaction,
  BudgetProgress,
  Subscription,
  PaymentOrder,
  AIAuditLog,
  AdminAuditLog,
  TransactionItem,
} from "@/types";

export interface DatabaseStore {
  profile: UserProfile;
  registeredUsers: UserProfile[];
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transactionItems: TransactionItem[];
  budgets: {
    id: string;
    userId: string;
    categoryId: string;
    periodMonth: string;
    capAmount: number;
    alert80Sent: boolean;
    alert100Sent: boolean;
  }[];
  subscription: Subscription;
  paymentOrders: PaymentOrder[];
  aiLogs: AIAuditLog[];
  adminLogs: AdminAuditLog[];
}

const INITIAL_USER_ID = "usr-lily-001";

export const initialStore: DatabaseStore = {
  profile: {
    id: INITIAL_USER_ID,
    fullName: "Lily Latifah",
    email: "lilylatifah1234@gmail.com",
    phoneWhatsapp: "+6281288991122",
    role: "superadmin",
    approvalStatus: "approved",
    defaultCurrency: "IDR",
    telegramChatId: 782194821,
    telegramConnected: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    createdAt: "2026-01-15T08:00:00+07:00",
    updatedAt: "2026-10-12T10:00:00+07:00",
  },
  wallets: [
    {
      id: "w-bca-prio",
      userId: INITIAL_USER_ID,
      name: "BCA Prioritas",
      type: "bank",
      balance: 0,
      isDefault: true,
      currency: "IDR",
      createdAt: "2026-01-15T08:10:00+07:00",
      updatedAt: "2026-10-12T09:30:00+07:00",
    },
    {
      id: "w-mandiri-biz",
      userId: INITIAL_USER_ID,
      name: "Mandiri Bisnis Operasional",
      type: "bank",
      balance: 0,
      isDefault: false,
      currency: "IDR",
      createdAt: "2026-01-15T08:15:00+07:00",
      updatedAt: "2026-10-11T14:20:00+07:00",
    },
    {
      id: "w-bibit-invest",
      userId: INITIAL_USER_ID,
      name: "Bibit Reksadana & SBN",
      type: "investment",
      balance: 0,
      isDefault: false,
      currency: "IDR",
      createdAt: "2026-01-15T08:20:00+07:00",
      updatedAt: "2026-10-10T11:00:00+07:00",
    },
    {
      id: "w-gopay-exec",
      userId: INITIAL_USER_ID,
      name: "GoPay & OVO Executive",
      type: "ewallet",
      balance: 0,
      isDefault: false,
      currency: "IDR",
      createdAt: "2026-01-15T08:25:00+07:00",
      updatedAt: "2026-10-12T08:15:00+07:00",
    },
    {
      id: "w-cash-brankas",
      userId: INITIAL_USER_ID,
      name: "Kas Tunai Pribadi",
      type: "cash",
      balance: 0,
      isDefault: false,
      currency: "IDR",
      createdAt: "2026-01-15T08:30:00+07:00",
      updatedAt: "2026-10-09T18:00:00+07:00",
    },
    {
      id: "w-valas-usd",
      userId: INITIAL_USER_ID,
      name: "Rekening Valas USD ($12,500)",
      type: "foreign_currency",
      balance: 0,
      isDefault: false,
      currency: "USD",
      createdAt: "2026-02-01T10:00:00+07:00",
      updatedAt: "2026-10-08T12:00:00+07:00",
    },
  ],
  categories: [
    {
      id: "cat-dining",
      userId: INITIAL_USER_ID,
      name: "Executive Dining & Coffee",
      type: "expense",
      iconEmoji: "🍽️",
      colorHex: "#0284C7",
      monthlyBudgetCap: 12000000,
      createdAt: "2026-01-15T08:40:00+07:00",
    },
    {
      id: "cat-saas",
      userId: INITIAL_USER_ID,
      name: "SaaS & Cloud Services",
      type: "expense",
      iconEmoji: "💻",
      colorHex: "#6366F1",
      monthlyBudgetCap: 8000000,
      createdAt: "2026-01-15T08:42:00+07:00",
    },
    {
      id: "cat-health",
      userId: INITIAL_USER_ID,
      name: "Family & Health Care",
      type: "expense",
      iconEmoji: "🏥",
      colorHex: "#059669",
      monthlyBudgetCap: 15000000,
      createdAt: "2026-01-15T08:45:00+07:00",
    },
    {
      id: "cat-travel",
      userId: INITIAL_USER_ID,
      name: "Luxury Travel & Flight",
      type: "expense",
      iconEmoji: "✈️",
      colorHex: "#EC4899",
      monthlyBudgetCap: 20000000,
      createdAt: "2026-01-15T08:48:00+07:00",
    },
    {
      id: "cat-auto",
      userId: INITIAL_USER_ID,
      name: "Automotive & Fuel",
      type: "expense",
      iconEmoji: "⛽",
      colorHex: "#D97706",
      monthlyBudgetCap: 6000000,
      createdAt: "2026-01-15T08:50:00+07:00",
    },
    {
      id: "cat-salary",
      userId: INITIAL_USER_ID,
      name: "Executive Director Salary",
      type: "income",
      iconEmoji: "💼",
      colorHex: "#059669",
      monthlyBudgetCap: 0,
      createdAt: "2026-01-15T08:52:00+07:00",
    },
    {
      id: "cat-dividend",
      userId: INITIAL_USER_ID,
      name: "Dividen Bisnis & Retainer",
      type: "income",
      iconEmoji: "🏛️",
      colorHex: "#10B981",
      monthlyBudgetCap: 0,
      createdAt: "2026-01-15T08:55:00+07:00",
    },
  ],
  transactions: [],
  transactionItems: [],
  budgets: [],
  subscription: {
    userId: INITIAL_USER_ID,
    planType: "pro", // PRO VIP aktif
    status: "active",
    monthlyTxCount: 28,
    txQuota: -1, // Unlimited
    expiredAt: "2027-10-12T00:00:00+07:00",
    resetAt: "2026-11-01T00:00:00+07:00",
  },
  paymentOrders: [],
  aiLogs: [],
  adminLogs: [
    {
      id: "adm-001",
      adminId: "adm-root-001",
      adminName: "Superadmin TataDana",
      targetUserId: INITIAL_USER_ID,
      targetUserName: "Lily Latifah",
      action: "VIEW_TRANSACTION_AUDIT",
      reason: "Verifikasi integrasi webhook telegram sandbox",
      ipAddress: "127.0.0.1",
      createdAt: "2026-10-12T10:30:00+07:00",
    },
  ],
  registeredUsers: [
    {
      id: INITIAL_USER_ID,
      fullName: "Lily Latifah",
      email: "lilylatifah1234@gmail.com",
      phoneWhatsapp: "+6281288991122",
      role: "superadmin",
      approvalStatus: "approved",
      defaultCurrency: "IDR",
      telegramChatId: 782194821,
      telegramConnected: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      createdAt: "2026-01-15T08:00:00+07:00",
      updatedAt: "2026-10-12T10:00:00+07:00",
    },
  ],
};

// Safe access to node:fs and node:path on server side without breaking client bundles
const isServer = typeof window === "undefined";
let fs: any = null;
let path: any = null;
if (isServer) {
  try {
    fs = eval("require")("fs");
    path = eval("require")("path");
  } catch (e) {
    fs = null;
    path = null;
  }
}

const DATA_DIR = isServer && path ? path.join(process.cwd(), "data") : "";
const DATA_FILE = isServer && path ? path.join(DATA_DIR, "tatadana-store.json") : "";

function ensureDataDirectory() {
  if (isServer && fs && DATA_DIR && !fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error("Gagal membuat direktori data:", e);
    }
  }
}

function loadStoreFromFile(): DatabaseStore {
  if (!isServer || !fs || !DATA_FILE) {
    return initialStore;
  }
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (parsed && parsed.profile && Array.isArray(parsed.wallets) && Array.isArray(parsed.transactions)) {
          // Ensure registeredUsers exists
          if (!parsed.registeredUsers || !Array.isArray(parsed.registeredUsers) || parsed.registeredUsers.length === 0) {
            parsed.registeredUsers = JSON.parse(JSON.stringify(initialStore.registeredUsers || []));
          }
          // Ensure Lily Latifah has role & approved status if not set
          if (parsed.profile.email === "lilylatifah1234@gmail.com") {
            if (!parsed.profile.role) {
              parsed.profile.role = "superadmin";
            }
            if (!parsed.profile.approvalStatus) {
              parsed.profile.approvalStatus = "approved";
            }
          }
          return parsed as DatabaseStore;
        }
      }
    }
  } catch (err) {
    console.error("Gagal membaca database lokal dari file, memulihkan default:", err);
  }

  // File belum ada atau invalid: inisialisasi file default dan simpan
  const fresh = JSON.parse(JSON.stringify(initialStore)) as DatabaseStore;
  saveStoreToFile(fresh);
  return fresh;
}

function saveStoreToFile(currentStore: DatabaseStore): void {
  if (!isServer || !fs || !path || !DATA_FILE) {
    return;
  }
  try {
    ensureDataDirectory();
    const jsonString = JSON.stringify(currentStore, null, 2);
    const tempFile = path.join(
      DATA_DIR,
      `tatadana-store.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`
    );
    try {
      fs.writeFileSync(tempFile, jsonString, "utf-8");
      fs.renameSync(tempFile, DATA_FILE);
    } catch {
      // Fallback direct write untuk sistem Windows file-lock
      fs.writeFileSync(DATA_FILE, jsonString, "utf-8");
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {}
    }
  } catch (err) {
    console.error("Gagal menulis database lokal ke file:", err);
  }
}

export const db = {
  // Profiles
  async getProfile(): Promise<UserProfile> {
    const store = loadStoreFromFile();
    return { ...store.profile };
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const store = loadStoreFromFile();
    store.profile = {
      ...store.profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (store.registeredUsers && Array.isArray(store.registeredUsers)) {
      const idx = store.registeredUsers.findIndex(
        (u) =>
          u.id === store.profile.id ||
          (store.profile.email && u.email.toLowerCase() === store.profile.email.toLowerCase())
      );
      if (idx !== -1) {
        store.registeredUsers[idx] = {
          ...store.registeredUsers[idx],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    saveStoreToFile(store);
    return { ...store.profile };
  },

  // Wallets
  async getWallets(userId?: string): Promise<Wallet[]> {
    const store = loadStoreFromFile();
    const currentUserId = userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com" || currentUserId === INITIAL_USER_ID;

    if (isOwner) {
      return [...store.wallets.filter((w) => w.userId === INITIAL_USER_ID || !w.userId)];
    }

    return [...store.wallets.filter((w) => w.userId === currentUserId)];
  },

  async getWalletById(id: string): Promise<Wallet | undefined> {
    const store = loadStoreFromFile();
    return store.wallets.find((w) => w.id === id);
  },

  async createWallet(data: Omit<Wallet, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Wallet> {
    const store = loadStoreFromFile();
    const newWallet: Wallet = {
      id: `w-${Date.now()}`,
      userId: store.profile.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newWallet.isDefault) {
      store.wallets.forEach((w) => (w.isDefault = false));
    }
    store.wallets.push(newWallet);
    saveStoreToFile(store);
    return newWallet;
  },

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | null> {
    const store = loadStoreFromFile();
    const index = store.wallets.findIndex((w) => w.id === id);
    if (index === -1) return null;
    if (updates.isDefault) {
      store.wallets.forEach((w) => (w.isDefault = false));
    }
    store.wallets[index] = {
      ...store.wallets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStoreToFile(store);
    return store.wallets[index];
  },

  async deleteWallet(id: string): Promise<boolean> {
    const store = loadStoreFromFile();
    const initialLen = store.wallets.length;
    store.wallets = store.wallets.filter((w) => w.id !== id);
    const deleted = store.wallets.length < initialLen;
    if (deleted) {
      saveStoreToFile(store);
    }
    return deleted;
  },

  // Categories
  async getCategories(userId?: string): Promise<Category[]> {
    const store = loadStoreFromFile();
    const currentUserId = userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com" || currentUserId === INITIAL_USER_ID;

    if (isOwner) {
      return [...store.categories.filter((c) => c.userId === INITIAL_USER_ID || !c.userId)];
    }

    const userCategories = store.categories.filter((c) => c.userId === currentUserId);
    if (userCategories.length > 0) {
      return [...userCategories];
    }

    // Default starter categories with 0 budget cap
    return [
      { id: `cat-makan-${currentUserId}`, userId: currentUserId, name: "Makanan & Minuman", type: "expense", iconEmoji: "🍽️", colorHex: "#0284C7", monthlyBudgetCap: 0, createdAt: new Date().toISOString() },
      { id: `cat-transport-${currentUserId}`, userId: currentUserId, name: "Transportasi", type: "expense", iconEmoji: "🚗", colorHex: "#6366F1", monthlyBudgetCap: 0, createdAt: new Date().toISOString() },
      { id: `cat-belanja-${currentUserId}`, userId: currentUserId, name: "Belanja & Kebutuhan", type: "expense", iconEmoji: "🛒", colorHex: "#EC4899", monthlyBudgetCap: 0, createdAt: new Date().toISOString() },
      { id: `cat-tagihan-${currentUserId}`, userId: currentUserId, name: "Tagihan & Utilitas", type: "expense", iconEmoji: "⚡", colorHex: "#F59E0B", monthlyBudgetCap: 0, createdAt: new Date().toISOString() },
      { id: `cat-gaji-${currentUserId}`, userId: currentUserId, name: "Gaji & Pemasukan", type: "income", iconEmoji: "💼", colorHex: "#059669", monthlyBudgetCap: 0, createdAt: new Date().toISOString() },
    ];
  },

  async createCategory(data: Omit<Category, "id" | "userId" | "createdAt">): Promise<Category> {
    const store = loadStoreFromFile();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      userId: store.profile.id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.categories.push(newCat);
    saveStoreToFile(store);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const store = loadStoreFromFile();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    store.categories[index] = { ...store.categories[index], ...updates };
    saveStoreToFile(store);
    return store.categories[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const store = loadStoreFromFile();
    const initialLen = store.categories.length;
    store.categories = store.categories.filter((c) => c.id !== id);
    const deleted = store.categories.length < initialLen;
    if (deleted) {
      saveStoreToFile(store);
    }
    return deleted;
  },

  // Transactions
  async getTransactions(filters?: {
    type?: string;
    categoryId?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string;
  }): Promise<Transaction[]> {
    const store = loadStoreFromFile();
    const currentUserId = filters?.userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com" || currentUserId === INITIAL_USER_ID;

    let result = isOwner
      ? store.transactions.filter((t) => t.userId === INITIAL_USER_ID || !t.userId)
      : store.transactions.filter((t) => t.userId === currentUserId);

    if (filters?.type && filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters?.categoryId && filters.categoryId !== "all") {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters?.walletId && filters.walletId !== "all") {
      result = result.filter((t) => t.walletId === filters.walletId || t.toWalletId === filters.walletId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.walletName.toLowerCase().includes(q) ||
          t.items?.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }
    if (filters?.startDate) {
      result = result.filter((t) => new Date(t.txTimestamp) >= new Date(filters.startDate!));
    }
    if (filters?.endDate) {
      result = result.filter((t) => new Date(t.txTimestamp) <= new Date(filters.endDate!));
    }

    // Sort by timestamp descending
    return result.sort((a, b) => new Date(b.txTimestamp).getTime() - new Date(a.txTimestamp).getTime());
  },

  async createTransaction(
    data: Omit<Transaction, "id" | "userId" | "createdAt" | "txTimestamp" | "items"> & {
      txTimestamp?: string;
      items?: (Omit<TransactionItem, "id" | "transactionId"> | TransactionItem)[];
    }
  ): Promise<Transaction> {
    const store = loadStoreFromFile();
    const txId = `tx-${Date.now()}`;
    const formattedItems: TransactionItem[] = (data.items || []).map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      transactionId: txId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      categoryId: item.categoryId || data.categoryId,
    }));

    const newTx: Transaction = {
      id: txId,
      userId: store.profile.id,
      walletId: data.walletId,
      walletName: data.walletName,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      categoryEmoji: data.categoryEmoji,
      categoryColor: data.categoryColor,
      type: data.type,
      amount: data.amount,
      toWalletId: data.toWalletId,
      toWalletName: data.toWalletName,
      adminFee: data.adminFee || 0,
      note: data.note,
      source: data.source,
      receiptImageUrl: data.receiptImageUrl,
      items: formattedItems,
      txTimestamp: data.txTimestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Update wallet balance secara atomik dan permanen
    const originWallet = store.wallets.find((w) => w.id === newTx.walletId);
    if (originWallet) {
      if (newTx.type === "expense") {
        originWallet.balance -= newTx.amount;
      } else if (newTx.type === "income") {
        originWallet.balance += newTx.amount;
      } else if (newTx.type === "transfer") {
        originWallet.balance -= newTx.amount + (newTx.adminFee || 0);
        if (newTx.toWalletId) {
          const targetWallet = store.wallets.find((w) => w.id === newTx.toWalletId);
          if (targetWallet) {
            targetWallet.balance += newTx.amount;
          }
        }
      }
    }

    // Increment user quota counter
    store.subscription.monthlyTxCount += 1;

    store.transactions.unshift(newTx);

    // Simpan permanen ke disk
    saveStoreToFile(store);
    return newTx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const store = loadStoreFromFile();
    const tx = store.transactions.find((t) => t.id === id);
    if (!tx) return false;

    // Rollback wallet balance
    const originWallet = store.wallets.find((w) => w.id === tx.walletId);
    if (originWallet) {
      if (tx.type === "expense") {
        originWallet.balance += tx.amount;
      } else if (tx.type === "income") {
        originWallet.balance -= tx.amount;
      } else if (tx.type === "transfer") {
        originWallet.balance += tx.amount + (tx.adminFee || 0);
        if (tx.toWalletId) {
          const targetWallet = store.wallets.find((w) => w.id === tx.toWalletId);
          if (targetWallet) {
            targetWallet.balance -= tx.amount;
          }
        }
      }
    }

    store.transactions = store.transactions.filter((t) => t.id !== id);
    saveStoreToFile(store);
    return true;
  },

  // Budgets
  async getBudgets(periodMonth = "2026-10", userId?: string): Promise<BudgetProgress[]> {
    const store = loadStoreFromFile();
    const currentUserId = userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com" || currentUserId === INITIAL_USER_ID;

    const expenseCategories = isOwner
      ? store.categories.filter((c) => (c.userId === INITIAL_USER_ID || !c.userId) && c.type === "expense")
      : store.categories.filter((c) => c.userId === currentUserId && c.type === "expense");

    if (!isOwner && expenseCategories.length === 0) {
      return [];
    }

    const currentMonthTxs = isOwner
      ? store.transactions.filter(
          (t) =>
            (t.userId === INITIAL_USER_ID || !t.userId) &&
            t.type === "expense" &&
            t.txTimestamp.startsWith(periodMonth)
        )
      : store.transactions.filter(
          (t) =>
            t.userId === currentUserId &&
            t.type === "expense" &&
            t.txTimestamp.startsWith(periodMonth)
        );

    return expenseCategories.map((cat) => {
      const budgetRecord = store.budgets.find(
        (b) => b.categoryId === cat.id && b.periodMonth === periodMonth && (isOwner ? true : b.userId === currentUserId)
      );
      const capAmount = budgetRecord?.capAmount ?? cat.monthlyBudgetCap ?? 0;

      const spentAmount = currentMonthTxs
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const remainingAmount = capAmount - spentAmount;
      const percentage = capAmount > 0 ? Math.round((spentAmount / capAmount) * 100) : 0;

      let status: "safe" | "warning" | "critical" = "safe";
      if (percentage >= 100) {
        status = "critical";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return {
        id: budgetRecord?.id || `b-${cat.id}`,
        userId: currentUserId,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryEmoji: cat.iconEmoji,
        categoryColor: cat.colorHex,
        periodMonth,
        capAmount,
        spentAmount,
        remainingAmount,
        percentage,
        alert80Sent: budgetRecord?.alert80Sent ?? (percentage >= 80),
        alert100Sent: budgetRecord?.alert100Sent ?? (percentage >= 100),
        status,
      };
    });
  },

  async updateBudgetCap(categoryId: string, capAmount: number, periodMonth = "2026-10"): Promise<void> {
    const store = loadStoreFromFile();
    const existing = store.budgets.find(
      (b) => b.categoryId === categoryId && b.periodMonth === periodMonth
    );
    if (existing) {
      existing.capAmount = capAmount;
    } else {
      store.budgets.push({
        id: `b-${Date.now()}`,
        userId: store.profile.id,
        categoryId,
        periodMonth,
        capAmount,
        alert80Sent: false,
        alert100Sent: false,
      });
    }

    // Sync juga ke master kategori
    const cat = store.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.monthlyBudgetCap = capAmount;
    }
    saveStoreToFile(store);
  },

  // Subscriptions & Quota
  async getSubscription(userId?: string): Promise<Subscription> {
    const store = loadStoreFromFile();
    const currentUserId = userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com" || store.profile.role === "superadmin" || currentUserId === INITIAL_USER_ID;

    if (isOwner) {
      return {
        userId: INITIAL_USER_ID,
        planType: "pro",
        status: "active",
        monthlyTxCount: store.transactions.filter((t) => t.userId === INITIAL_USER_ID || !t.userId).length,
        txQuota: -1,
        resetAt: "2026-11-01T00:00:00+07:00",
      };
    }

    return {
      userId: currentUserId,
      planType: "starter",
      status: "active",
      monthlyTxCount: store.transactions.filter((t) => t.userId === currentUserId).length,
      txQuota: 75,
      resetAt: "2026-11-01T00:00:00+07:00",
    };
  },

  async upgradeSubscription(planType: "starter" | "pro" | "lifetime"): Promise<Subscription> {
    const store = loadStoreFromFile();
    store.subscription = {
      ...store.subscription,
      planType,
      status: "active",
      txQuota: planType === "starter" ? 75 : -1,
      expiredAt: planType === "lifetime" ? undefined : "2027-10-12T00:00:00+07:00",
    };
    saveStoreToFile(store);
    return { ...store.subscription };
  },

  // Payment Orders
  async getPaymentOrders(): Promise<PaymentOrder[]> {
    const store = loadStoreFromFile();
    return [...store.paymentOrders];
  },

  async createPaymentOrder(data: Omit<PaymentOrder, "id" | "createdAt" | "updatedAt">): Promise<PaymentOrder> {
    const store = loadStoreFromFile();
    const newOrder: PaymentOrder = {
      id: `pay-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.paymentOrders.unshift(newOrder);
    saveStoreToFile(store);
    return newOrder;
  },

  async updatePaymentOrderStatus(orderId: string, status: PaymentOrder["paymentStatus"]): Promise<boolean> {
    const store = loadStoreFromFile();
    const order = store.paymentOrders.find((p) => p.orderId === orderId);
    if (!order) return false;
    order.paymentStatus = status;
    order.updatedAt = new Date().toISOString();

    if (status === "settlement") {
      store.subscription = {
        ...store.subscription,
        planType: order.planType,
        status: "active",
        txQuota: order.planType === "starter" ? 75 : -1,
        expiredAt: order.planType === "lifetime" ? undefined : "2027-10-12T00:00:00+07:00",
      };
    }
    saveStoreToFile(store);
    return true;
  },

  // AI Logs & Analytics
  async getAILogs(): Promise<AIAuditLog[]> {
    const store = loadStoreFromFile();
    return [...store.aiLogs];
  },

  async addAILog(log: Omit<AIAuditLog, "id" | "createdAt">): Promise<AIAuditLog> {
    const store = loadStoreFromFile();
    const newLog: AIAuditLog = {
      id: `ai-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    store.aiLogs.unshift(newLog);
    saveStoreToFile(store);
    return newLog;
  },

  // Admin Audit Logs
  async getAdminLogs(): Promise<AdminAuditLog[]> {
    const store = loadStoreFromFile();
    return [...store.adminLogs];
  },

  async addAdminLog(log: Omit<AdminAuditLog, "id" | "createdAt">): Promise<AdminAuditLog> {
    const store = loadStoreFromFile();
    const newLog: AdminAuditLog = {
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    store.adminLogs.unshift(newLog);
    saveStoreToFile(store);
    return newLog;
  },

  // Store Summary & Full Data Management
  async getStoreSummary() {
    const store = loadStoreFromFile();
    const totalBalance = store.wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalIncome = store.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = store.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      profile: store.profile,
      subscription: store.subscription,
      walletsCount: store.wallets.length,
      categoriesCount: store.categories.length,
      transactionsCount: store.transactions.length,
      paymentOrdersCount: store.paymentOrders.length,
      aiLogsCount: store.aiLogs.length,
      adminLogsCount: store.adminLogs.length,
      totalBalance,
      totalIncome,
      totalExpense,
      storageFile: "data/tatadana-store.json",
      persisted: true,
      lastUpdated: store.profile.updatedAt,
    };
  },

  async getFullStore(): Promise<DatabaseStore> {
    const store = loadStoreFromFile();
    return JSON.parse(JSON.stringify(store));
  },

  async restoreStore(newStore: DatabaseStore): Promise<boolean> {
    saveStoreToFile(newStore);
    return true;
  },

  // Registered Users & Approval Management
  async getRegisteredUsers(): Promise<UserProfile[]> {
    const store = loadStoreFromFile();
    return [...(store.registeredUsers || [])];
  },

  async findUserByEmail(email: string): Promise<UserProfile | undefined> {
    const store = loadStoreFromFile();
    return (store.registeredUsers || []).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  async registerUser(data: Partial<UserProfile>): Promise<UserProfile> {
    const store = loadStoreFromFile();
    if (!store.registeredUsers) {
      store.registeredUsers = JSON.parse(JSON.stringify(initialStore.registeredUsers || []));
    }

    const email = data.email?.toLowerCase().trim() || "";
    const existingIndex = store.registeredUsers.findIndex(
      (u) => u.email.toLowerCase() === email
    );

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName?.trim() || "User Baru",
      email,
      password: data.password || "",
      phoneWhatsapp: data.phoneWhatsapp || "",
      role: "user",
      approvalStatus: "pending",
      defaultCurrency: (data.defaultCurrency as any) || "IDR",
      telegramConnected: false,
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
      registrationToken: data.registrationToken || "47893",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      store.registeredUsers[existingIndex] = {
        ...store.registeredUsers[existingIndex],
        ...newUser,
        id: store.registeredUsers[existingIndex].id,
      };
    } else {
      store.registeredUsers.unshift(newUser);
    }

    // Catat ke admin log
    store.adminLogs.unshift({
      id: `adm-${Date.now()}`,
      adminId: "system-auth",
      adminName: "Registration Pipeline",
      targetUserId: newUser.id,
      targetUserName: newUser.fullName,
      action: "USER_REGISTERED_PENDING_APPROVAL",
      reason: `Pendaftaran baru ${newUser.email} menunggu aktivasi superadmin`,
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    saveStoreToFile(store);
    return newUser;
  },

  async updateUserApproval(
    userId: string,
    status: "approved" | "rejected",
    reason?: string
  ): Promise<UserProfile | null> {
    const store = loadStoreFromFile();
    if (!store.registeredUsers) return null;

    const userIndex = store.registeredUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    store.registeredUsers[userIndex].approvalStatus = status;
    store.registeredUsers[userIndex].updatedAt = new Date().toISOString();
    if (reason) {
      store.registeredUsers[userIndex].rejectionReason = reason;
    }

    // Catat audit log
    store.adminLogs.unshift({
      id: `adm-${Date.now()}`,
      adminId: "adm-root-001",
      adminName: "Superadmin Lily Latifah",
      targetUserId: userId,
      targetUserName: store.registeredUsers[userIndex].fullName,
      action: status === "approved" ? "APPROVE_USER_REGISTRATION" : "REJECT_USER_REGISTRATION",
      reason: reason || (status === "approved" ? "Pendaftaran pengguna disetujui & akun diaktifkan" : "Pendaftaran ditolak oleh Superadmin"),
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    });

    saveStoreToFile(store);
    return store.registeredUsers[userIndex];
  },

  async switchActiveUser(userId: string): Promise<UserProfile | null> {
    const store = loadStoreFromFile();
    const targetUser = (store.registeredUsers || []).find((u) => u.id === userId);
    if (!targetUser) return null;

    store.profile = { ...targetUser, updatedAt: new Date().toISOString() };
    saveStoreToFile(store);
    return store.profile;
  },

  // Reset to default configuration
  resetToDefaults(): void {
    const fresh = JSON.parse(JSON.stringify(initialStore));
    saveStoreToFile(fresh);
  },
};
