"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiX,
  FiSend,
  FiCamera,
  FiShoppingBag,
  FiHeart,
  FiTruck,
  FiRefreshCw,
  FiExternalLink,
  FiCompass,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useToast } from "@/app/context/ToastContext";
import {
  DEFAULT_QUICK_PROMPTS,
  PRODUCT_PAGE_QUICK_PROMPTS,
} from "@ai/config/constants";
import {
  AiChatMessage,
  AiChatResponse,
  AiClientAction,
  AiOrderSummary,
  AiProductCard,
} from "@ai/types";

const ORDER_STEPS = [
  "Pending",
  "Processing",
  "Dispatched",
  "Shipped",
  "Delivered",
];

export default function ChatbotWidget() {
  const pathname = usePathname();
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interactionId, setInteractionId] = useState<string | undefined>(
    undefined
  );
  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect if user is currently on a Product Detail route (/product/[id])
  const currentProductId = React.useMemo(() => {
    if (!pathname) return undefined;
    const match = pathname.match(/^\/product\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }, [pathname]);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Welcome to **Furniro AI Concierge**! I can help you find furniture by room or budget, match styles from a photo, add items directly to your cart, or track your orders.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chipsContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading, scrollToBottom]);

  // Execute agent-returned client actions (Cart / Wishlist mutations)
  const executeClientActions = useCallback(
    (actions?: AiClientAction[]) => {
      if (!actions || actions.length === 0) return;

      for (const act of actions) {
        if (act.type === "CLEAR_CART") {
          clearCart();
          showToast({
            message: "AI Concierge cleared your cart",
            type: "info",
          });
          continue;
        }

        const p = act.product;
        if (!p) continue;

        if (act.type === "ADD_TO_CART") {
          const qty = act.quantity || 1;
          addToCart({
            id: p.id,
            name: p.title,
            price: p.finalPrice,
            quantity: qty,
            image: p.imageUrl,
          });
          showToast({
            message: `AI added ${qty}x "${p.title}" to cart`,
            type: "success",
            actionLabel: "View Cart",
            actionHref: "/cart",
          });
        } else if (act.type === "REMOVE_FROM_CART") {
          removeFromCart(p.id);
          showToast({
            message: `Removed "${p.title}" from cart`,
            type: "info",
          });
        } else if (
          act.type === "ADD_TO_FAVORITES" ||
          act.type === "REMOVE_FROM_FAVORITES"
        ) {
          toggleFavorite(p.id, p.title);
        }
      }
    },
    [addToCart, clearCart, removeFromCart, showToast, toggleFavorite]
  );

  const sendMessage = useCallback(
    async (overridePrompt?: string) => {
      const textToSend = (
        overridePrompt !== undefined ? overridePrompt : input
      ).trim();

      if ((!textToSend && !attachedImage) || isLoading) return;

      const currentAttachment = attachedImage;
      const userMessage: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content:
          textToSend || "Find furniture in our store matching this photo",
        timestamp: new Date().toISOString(),
        attachedImagePreview: currentAttachment?.previewUrl,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (overridePrompt === undefined) {
        setInput("");
      }
      setAttachedImage(null);
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            previousInteractionId: interactionId,
            pageContext: {
              pathname: pathname || "/",
              currentProductId,
              cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
              favoriteIds,
            },
            imageBase64: currentAttachment?.base64,
            imageMimeType: currentAttachment?.mimeType,
          }),
        });

        const data = (await res.json()) as AiChatResponse;

        if (data.interactionId) {
          setInteractionId(data.interactionId);
        }

        if (data.clientActions && data.clientActions.length > 0) {
          executeClientActions(data.clientActions);
        }

        const assistantMessage: AiChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            data.reply ||
            "Here is what I found in our showroom collection for you:",
          timestamp: new Date().toISOString(),
          products: data.products,
          orders: data.orders,
          clientActions: data.clientActions,
          visualAnalysis: data.visualAnalysis,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Failed to send AI chat message:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content:
              "I had trouble reaching the showroom server. Please try again in a moment!",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      attachedImage,
      cartItems,
      currentProductId,
      executeClientActions,
      favoriteIds,
      input,
      interactionId,
      isLoading,
      pathname,
    ]
  );

  // Allow external components to trigger the AI Concierge with a prefilled prompt
  useEffect(() => {
    const handleOpenAiChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        sendMessage(customEvent.detail.prompt);
      }
    };
    window.addEventListener("furniro:open-ai-chat", handleOpenAiChat);
    return () =>
      window.removeEventListener("furniro:open-ai-chat", handleOpenAiChat);
  }, [sendMessage]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast({
        message: "Please choose an image smaller than 4MB",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedImage({
        base64: dataUrl,
        mimeType: file.type || "image/jpeg",
        previewUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const resetChat = () => {
    setInteractionId(undefined);
    setAttachedImage(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Conversation reset! How can I help you style your space or manage your cart today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleQuickAddProduct = (product: AiProductCard) => {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.finalPrice,
      quantity: 1,
      image: product.imageUrl,
    });
    showToast({
      message: `Added "${product.title}" to cart`,
      type: "success",
      actionLabel: "View Cart",
      actionHref: "/cart",
    });
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-[#9A7320]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const quickPrompts = currentProductId
    ? PRODUCT_PAGE_QUICK_PROMPTS
    : DEFAULT_QUICK_PROMPTS;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Vertical Portrait Chat Window — Light, Warm Cream & Gold Theme */}
      {isOpen && (
        <aside
          aria-label="Furniro AI Concierge Chat"
          style={{
            width: "min(380px, calc(100vw - 24px))",
            height: "min(540px, calc(100vh - 116px))",
            zIndex: 9990,
          }}
          className="fixed bottom-[86px] right-3 sm:right-6 rounded-2xl bg-[#FAF4EC] border border-[#DEC7A4] ring-1 ring-[#B88E2F]/20 shadow-[0_20px_50px_rgba(140,104,30,0.22)] flex flex-col overflow-hidden"
        >
          {/* Warm Gold & Cream Header */}
          <div className="bg-gradient-to-r from-[#B88E2F] to-[#C89D3C] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-[#FFF6E8] text-[#B88E2F] flex items-center justify-center shadow-xs shrink-0">
                <HiSparkles className="text-xl" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#B88E2F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide text-white">
                    Furniro AI Concierge
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-[#FFF6E8]/90 mt-0.5">
                  Shop • Visual Match • Cart &amp; Orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                title="Reset conversation"
                className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
              >
                <FiRefreshCw className="text-sm" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize AI Concierge"
                className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
              >
                <FiChevronDown className="text-lg" />
              </button>
            </div>
          </div>

          {/* Page-Aware Co-Browsing Banner */}
          {currentProductId && (
            <div className="bg-[#FFF3E3] border-b border-[#E8D5B7] px-4 py-2 flex items-center justify-between text-xs text-gray-800 shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <FiCompass className="text-[#B88E2F] shrink-0" />
                <span className="truncate">
                  Viewing <strong className="text-[#B88E2F]">Product Page</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  sendMessage("What furniture pairs well with this item?")
                }
                className="text-[11px] font-bold text-[#B88E2F] hover:underline shrink-0 ml-2"
              >
                Match Pairings →
              </button>
            </div>
          )}

          {/* Messages Stream — Soft Warm Cream Interior (#FAF4EC) with Crisp White Assistant Cards */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 bg-[#FAF4EC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    msg.role === "user"
                      ? "bg-[#B88E2F] text-white font-medium rounded-br-xs"
                      : "bg-white text-gray-800 border border-[#E8D9C5] rounded-bl-xs"
                  }`}
                >
                  {msg.attachedImagePreview && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-white/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.attachedImagePreview}
                        alt="Uploaded room reference"
                        className="w-full max-h-36 object-cover"
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-line">
                    {msg.role === "assistant"
                      ? renderFormattedText(msg.content)
                      : msg.content}
                  </p>
                </div>

                {/* Visual Analysis Chips (when photo was analyzed) */}
                {msg.visualAnalysis && (
                  <div className="mt-2 w-full max-w-[92%] bg-[#FFF8EE] border border-[#E6D3B3] rounded-xl p-2.5 text-xs text-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#B88E2F]">
                        {msg.visualAnalysis.detectedStyle}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-gray-600 border border-[#E6D3B3]">
                        {msg.visualAnalysis.detectedCategory}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.visualAnalysis.colorPalette.map((color) => (
                        <span
                          key={color}
                          className="text-[10px] bg-white px-2 py-0.5 rounded-md text-gray-700 border border-[#EFE2CE]"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Actions Confirmation Pill */}
                {msg.clientActions && msg.clientActions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {msg.clientActions.map((act, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full"
                      >
                        <FiCheckCircle className="text-emerald-600" />
                        {act.type === "ADD_TO_CART" &&
                          `Added ${act.quantity || 1}x to Cart`}
                        {act.type === "REMOVE_FROM_CART" && "Removed from Cart"}
                        {act.type === "CLEAR_CART" && "Cart Cleared"}
                        {act.type === "ADD_TO_FAVORITES" && "Saved to Wishlist"}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {msg.products.map((product) => {
                      const fav = isFavorite(product.id);
                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-[#E6D5BD] hover:border-[#B88E2F] rounded-xl p-2.5 flex items-center gap-3 shadow-2xs transition-all"
                        >
                          <Link
                            href={`/product/${product.id}`}
                            className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F9F1E7] shrink-0 border border-[#EFE2CE]"
                          >
                            <Image
                              src={product.imageUrl}
                              alt={product.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                            {product.discountPercentage > 0 && (
                              <span className="absolute top-0.5 left-0.5 bg-[#E97171] text-white text-[9px] font-bold px-1 rounded">
                                -{product.discountPercentage}%
                              </span>
                            )}
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${product.id}`}
                              className="text-xs font-bold text-gray-900 hover:text-[#B88E2F] truncate block"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-extrabold text-[#B88E2F]">
                                ${product.finalPrice.toLocaleString()}
                              </span>
                              {product.discountPercentage > 0 && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  ${product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.matchReason && (
                              <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                {product.matchReason}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickAddProduct(product)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#B88E2F] hover:bg-[#9f7924] text-white px-2.5 py-1 rounded-md transition-colors"
                              >
                                <FiShoppingBag className="text-[10px]" />
                                Add to Cart
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleFavorite(product.id, product.title)
                                }
                                aria-label="Toggle favorite"
                                className={`p-1.5 rounded-md border transition-colors ${
                                  fav
                                    ? "bg-red-50 border-red-200 text-red-500"
                                    : "bg-[#FCF8F3] border-[#E6D5BD] text-gray-600 hover:text-red-500"
                                }`}
                              >
                                <FiHeart
                                  className={`text-xs ${
                                    fav ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                              <Link
                                href={`/product/${product.id}`}
                                className="p-1.5 rounded-md bg-[#FCF8F3] border border-[#E6D5BD] text-gray-600 hover:text-[#B88E2F] transition-colors"
                                title="View Product Details"
                              >
                                <FiExternalLink className="text-xs" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Interactive Live Order Tracking Cards */}
                {msg.orders && msg.orders.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {msg.orders.map((order: AiOrderSummary) => {
                      const stepIdx = Math.max(
                        0,
                        ORDER_STEPS.findIndex(
                          (s) =>
                            s.toLowerCase() === order.orderStatus.toLowerCase()
                        )
                      );
                      return (
                        <div
                          key={order.orderId}
                          className="bg-white border border-[#E6D5BD] rounded-xl p-3 shadow-2xs text-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                              <FiTruck className="text-[#B88E2F]" />
                              Order #{order.orderId.slice(0, 8)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF3E3] text-[#B88E2F]">
                              {order.orderStatus}
                            </span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="grid grid-cols-5 gap-1 my-2">
                            {ORDER_STEPS.map((step, idx) => (
                              <div key={step} className="flex flex-col gap-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    idx <= stepIdx
                                      ? "bg-[#B88E2F]"
                                      : "bg-[#EFE2CE]"
                                  }`}
                                />
                                <span className="text-[9px] text-gray-500 font-medium truncate">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#F2E6D5] mt-1">
                            <span className="text-gray-600 font-medium">
                              Total:{" "}
                              <strong className="text-gray-900">
                                ${order.totalPrice.toLocaleString()}
                              </strong>
                            </span>
                            <Link
                              href={`/track-order?orderId=${encodeURIComponent(
                                order.orderId
                              )}`}
                              className="text-[#B88E2F] font-bold hover:underline flex items-center gap-1"
                            >
                              Track <FiExternalLink />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-[#E8D9C5] rounded-2xl rounded-bl-xs px-4 py-2.5 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88E2F] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88E2F] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88E2F] animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Checking Furniro catalog...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips — Touch/Swipe & Wheel Scrollable with NO visible scrollbar */}
          <div
            ref={chipsContainerRef}
            onWheel={(e) => {
              if (chipsContainerRef.current && e.deltaY !== 0) {
                chipsContainerRef.current.scrollLeft += e.deltaY;
              }
            }}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="no-scrollbar px-3 py-2 bg-[#F5EBDD] border-t border-[#E6D5BD] flex items-center gap-1.5 overflow-x-auto shrink-0 select-none"
          >
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => sendMessage(prompt)}
                className="text-[11px] font-medium whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-[#B88E2F] text-gray-700 hover:text-white border border-[#DFC9A6] transition-colors shrink-0 shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Attached Image Preview Bar */}
          {attachedImage && (
            <div className="px-3 py-2 bg-[#FFF3E3] border-t border-[#E6D5BD] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage.previewUrl}
                  alt="Preview"
                  className="w-9 h-9 rounded-lg object-cover border border-[#B88E2F]"
                />
                <span className="text-xs text-gray-800 font-medium">
                  Photo ready for AI Visual Match
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Clean Light Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-[#E6D5BD] flex items-center gap-2 shrink-0"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload room or furniture photo for AI Visual Search"
              className="p-2.5 rounded-xl bg-[#FFF3E3] hover:bg-[#B88E2F] text-[#B88E2F] hover:text-white border border-[#E6D5BD] transition-colors shrink-0"
            >
              <FiCamera className="text-base" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                attachedImage
                  ? "Add a note about this photo..."
                  : "Ask for furniture, cart, or orders..."
              }
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-[#FAF4EC] border border-[#E2CEB0] focus:border-[#B88E2F] focus:bg-white rounded-xl px-3.5 py-2.5 focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !attachedImage)}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#9f7924] text-white disabled:opacity-40 transition-colors shrink-0 shadow-2xs"
            >
              <FiSend className="text-base" />
            </button>
          </form>
        </aside>
      )}

      {/* Floating Bottom-Right Launcher Button — Warm Gold & Cream (No Black!) */}
      <div
        style={{ zIndex: 9990 }}
        className="fixed bottom-6 right-3 sm:right-6"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={
            isOpen ? "Close Furniro AI Concierge" : "Open Furniro AI Concierge"
          }
          className={`group flex items-center gap-2.5 rounded-full border-2 border-[#FFF3E3] bg-gradient-to-r from-[#B88E2F] to-[#C89D3C] hover:from-[#a37c26] hover:to-[#b88e2f] text-white shadow-[0_12px_30px_rgba(184,142,47,0.4)] transition-all duration-300 hover:scale-105 ${
            isOpen ? "p-3" : "pl-2.5 pr-4 py-2"
          }`}
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF6E8] text-[#B88E2F] shadow-2xs shrink-0">
            {isOpen ? (
              <FiX className="text-lg" />
            ) : (
              <>
                <HiSparkles className="text-lg" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </>
            )}
          </span>

          {!isOpen && (
            <div className="text-left pr-0.5">
              <span className="block text-xs font-bold tracking-wide text-white leading-tight">
                AI Concierge
              </span>
              <span className="block text-[10px] font-medium text-[#FFF6E8] leading-tight mt-0.5">
                {currentProductId ? "Ask about this item" : "Shop & Style AI"}
              </span>
            </div>
          )}
        </button>
      </div>
    </>,
    document.body
  );
}
