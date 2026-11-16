export interface AiProductCard {
  id: string;
  title: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  imageUrl: string;
  isNew: boolean;
  tags: string[];
  description?: string;
  matchReason?: string;
}

export interface AiOrderSummary {
  orderId: string;
  trackingNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  createdAt: string;
  estimatedDeliveryDate?: string;
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
}

export type AiClientActionType =
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "CLEAR_CART"
  | "ADD_TO_FAVORITES"
  | "REMOVE_FROM_FAVORITES";

export interface AiClientAction {
  type: AiClientActionType;
  product?: AiProductCard;
  quantity?: number;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: AiProductCard[];
  order?: AiOrderSummary | null;
  orders?: AiOrderSummary[];
  clientActions?: AiClientAction[];
  attachedImagePreview?: string;
  visualAnalysis?: {
    detectedStyle: string;
    detectedCategory: string;
    colorPalette: string[];
    summary: string;
  };
}

export interface AiPageContext {
  pathname: string;
  currentProductId?: string;
  currentProductTitle?: string;
  cartCount?: number;
  favoriteIds?: string[];
}

export interface AiChatRequest {
  message: string;
  previousInteractionId?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  pageContext?: AiPageContext;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface AiChatResponse {
  reply: string;
  interactionId?: string;
  products?: AiProductCard[];
  orders?: AiOrderSummary[];
  clientActions?: AiClientAction[];
  visualAnalysis?: {
    detectedStyle: string;
    detectedCategory: string;
    colorPalette: string[];
    summary: string;
  };
  aiMode: "gemini" | "smart-local";
}

export interface AiVisualSearchResult {
  detectedStyle: string;
  detectedCategory: string;
  colorPalette: string[];
  keywords: string[];
  summary: string;
  products: AiProductCard[];
  aiMode: "gemini" | "smart-local";
}

export interface AiReviewInsightsResponse {
  overallSentiment: "Very Positive" | "Positive" | "Mixed" | "New Arrival";
  summary: string;
  pros: string[];
  considerations: string[];
  bestFor: string[];
  answer?: string;
  aiMode: "gemini" | "smart-local";
}
