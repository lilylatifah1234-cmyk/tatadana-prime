export type UserRole = "user" | "admin" | "superadmin";
export type ApprovalStatus = "approved" | "pending" | "rejected";
export type CurrencyCode = "IDR" | "USD" | "SGD";
export type WalletType = "bank" | "cash" | "ewallet" | "investment" | "foreign_currency";
export type TransactionType = "expense" | "income" | "transfer";
export type TransactionSource = "telegram_text" | "telegram_voice" | "telegram_receipt" | "web_manual" | "recurring_auto";
export type SubscriptionPlan = "starter" | "pro" | "lifetime";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";
export type PaymentStatus = "pending" | "settlement" | "expire" | "cancel" | "rejected";
export type PaymentMethod = "midtrans_snap" | "manual_transfer";
export type AIProvider = "gemini" | "openai" | "deepseek" | "fallback";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phoneWhatsapp: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  defaultCurrency: CurrencyCode;
  telegramChatId?: number;
  telegramConnected: boolean;
  avatarUrl?: string;
  registrationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  balance: number;
  isDefault: boolean;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: "expense" | "income";
  iconEmoji: string;
  colorHex: string;
  monthlyBudgetCap: number;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  categoryId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  walletName: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
  type: TransactionType;
  amount: number;
  toWalletId?: string;
  toWalletName?: string;
  adminFee?: number;
  note: string;
  source: TransactionSource;
  receiptImageUrl?: string;
  items?: TransactionItem[];
  txTimestamp: string; // ISO String (WIB)
  createdAt: string;
}

export interface BudgetProgress {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
  periodMonth: string; // 'YYYY-MM'
  capAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  alert80Sent: boolean;
  alert100Sent: boolean;
  status: "safe" | "warning" | "critical";
}

export interface Subscription {
  userId: string;
  planType: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyTxCount: number;
  txQuota: number; // 75 for starter, -1 for unlimited
  expiredAt?: string;
  resetAt: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  grossAmount: number;
  planType: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  snapToken?: string;
  paymentStatus: PaymentStatus;
  proofImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  provider: AIProvider;
  model: string;
  actionType: "text_parse" | "voice_transcribe" | "vision_receipt" | "wealth_advisor";
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId?: string;
  targetUserName?: string;
  action: string;
  reason: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ParsedTransactionPayload {
  jenis: TransactionType;
  nominal: number;
  kategori: string;
  wallet_asal?: string | null;
  wallet_tujuan?: string | null;
  catatan: string;
  items?: Array<{
    nama: string;
    kuantitas: number;
    harga: number;
    total: number;
  }>;
  confidence?: number;
  reasoning?: string;
}

export interface TelegramWebhookPayload {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
    caption?: string;
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      width: number;
      height: number;
    }>;
    voice?: {
      file_id: string;
      duration: number;
      mime_type?: string;
    };
    audio?: {
      file_id: string;
      duration: number;
      mime_type?: string;
    };
  };
}
