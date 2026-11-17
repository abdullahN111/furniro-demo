"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  FiX,
  FiCamera,
  FiUploadCloud,
  FiShoppingBag,
  FiHeart,
  FiExternalLink,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useToast } from "@/app/context/ToastContext";
import { SAMPLE_VISUAL_SEARCH_PRESETS } from "@ai/config/constants";
import { AiProductCard, AiVisualSearchResult } from "@ai/types";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisualSearchModal({
  isOpen,
  onClose,
}: VisualSearchModalProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [fileName, setFileName] = useState<string>("");
  const [customHint, setCustomHint] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiVisualSearchResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const analyzePhoto = async (params: {
    base64?: string;
    mime?: string;
    name?: string;
    presetId?: string;
    hint?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/visual-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: params.base64,
          mimeType: params.mime,
          fileName: params.name,
          presetId: params.presetId,
          customHint: params.hint ?? customHint,
        }),
      });

      if (!res.ok) {
        throw new Error("Visual search failed");
      }

      const data = (await res.json()) as AiVisualSearchResult;
      setResult(data);
    } catch (err) {
      console.error("Visual Search Error:", err);
      showToast({
        message: "Could not analyze image. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast({
        message: "Please select an image smaller than 4MB",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setImageBase64(dataUrl);
      setMimeType(file.type || "image/jpeg");
      setFileName(file.name);
      setSelectedPresetId(null);
      analyzePhoto({
        base64: dataUrl,
        mime: file.type || "image/jpeg",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePresetClick = (presetId: string) => {
    setSelectedPresetId(presetId);
    setPreviewUrl(null);
    setImageBase64(null);
    analyzePhoto({ presetId });
  };

  const handleAddToCart = (product: AiProductCard) => {
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

  return createPortal(
    <div
      onClick={onClose}
      style={{ zIndex: 9999 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-[#E2CEB0] overflow-hidden max-h-[92dvh] sm:max-h-[88vh] flex flex-col"
      >
        {/* Warm Cream & Gold Header — Responsive on Mobile */}
        <div className="bg-gradient-to-r from-[#FFF3E3] to-[#F9F1E7] border-b border-[#E6D5BD] px-4 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#B88E2F] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <FiCamera className="text-base sm:text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  AI Visual Search
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-[#B88E2F] text-white px-2 py-0.5 rounded-full shrink-0">
                  <HiSparkles />
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 line-clamp-2 sm:line-clamp-1">
                Upload a room or furniture photo to find matching Furniro pieces.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close visual search modal"
            className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-colors shrink-0"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-[#FAF6F0] flex-1">
          {/* Upload Dropzone & Style Note */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 items-stretch">
            <div className="md:col-span-7">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e.dataTransfer.files?.[0]);
                }}
                className="cursor-pointer h-full min-h-[135px] sm:min-h-[190px] border-2 border-dashed border-[#D6BE99] hover:border-[#B88E2F] bg-white hover:bg-[#FFF9F0] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all"
              >
                {previewUrl ? (
                  <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded room"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-[#B88E2F] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                      Tap to change photo
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFF3E3] text-[#B88E2F] flex items-center justify-center mb-2 sm:mb-3">
                      <FiUploadCloud className="text-xl sm:text-2xl" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      Tap to upload a room or furniture photo, or{" "}
                      <span className="text-[#B88E2F] underline">browse</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                      Supports JPG, PNG, WebP up to 4MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Instant Room Inspiration Presets + Optional Hint */}
            <div className="md:col-span-5 flex flex-col justify-between bg-[#F4ECE0] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#E2CEB0]">
              <div>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8C6A22] mb-2">
                  Or Try a Sample Room Style
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {SAMPLE_VISUAL_SEARCH_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset.id)}
                      className={`w-full text-left p-2 sm:p-2.5 rounded-xl border text-xs transition-all ${
                        selectedPresetId === preset.id
                          ? "border-[#B88E2F] bg-[#B88E2F] text-white shadow-xs"
                          : "border-[#E2CEB0] bg-white hover:border-[#B88E2F] text-gray-800"
                      }`}
                    >
                      <p className="font-bold text-xs">{preset.label}</p>
                      <p
                        className={`text-[11px] line-clamp-1 mt-0.5 ${
                          selectedPresetId === preset.id
                            ? "text-[#FFF6E8]"
                            : "text-gray-500"
                        }`}
                      >
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E2CEB0]">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Optional Focus Note
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customHint}
                    onChange={(e) => setCustomHint(e.target.value)}
                    placeholder="e.g. dining chair, wooden table..."
                    className="flex-1 min-w-0 text-xs bg-white border border-[#D6BE99] rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:border-[#B88E2F]"
                  />
                  {(imageBase64 || customHint.trim()) && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        analyzePhoto({
                          base64: imageBase64 || undefined,
                          mime: mimeType,
                          name: fileName,
                          presetId: selectedPresetId || undefined,
                          hint: customHint,
                        })
                      }
                      className="text-xs font-semibold bg-[#B88E2F] hover:bg-[#9f7924] text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      Match
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-8 sm:py-10 text-center space-y-2 bg-white rounded-xl sm:rounded-2xl border border-[#E6D5BD]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF3E3] text-[#B88E2F] animate-pulse">
                <HiSparkles className="text-xl" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 px-4">
                Analyzing furniture silhouette, materials &amp; color palette...
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500">
                Matching against live Furniro Sanity inventory
              </p>
            </div>
          )}

          {/* Results Section */}
          {!loading && result && (
            <div className="space-y-3.5 sm:space-y-4">
              {/* Detected Style Summary Banner */}
              <div className="bg-[#FFF3E3] border border-[#E2CEB0] rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 sm:mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#B88E2F]">
                      Detected Aesthetic:
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {result.detectedStyle}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.colorPalette.map((color) => (
                      <span
                        key={color}
                        className="text-[10px] sm:text-[11px] font-medium bg-white border border-[#E2CEB0] text-gray-700 px-2 py-0.5 rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Matched Products Grid */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5 sm:mb-3">
                  Closest Matching Pieces ({result.products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.products.map((product) => {
                    const fav = isFavorite(product.id);
                    return (
                      <div
                        key={product.id}
                        className="border border-[#E6D5BD] hover:border-[#B88E2F] rounded-xl p-2.5 sm:p-3 flex gap-3 bg-white shadow-2xs transition-all"
                      >
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#F9F1E7] shrink-0"
                        >
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link
                              href={`/product/${product.id}`}
                              onClick={onClose}
                              className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#B88E2F] truncate block"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs sm:text-sm font-bold text-[#B88E2F]">
                                ${product.finalPrice.toLocaleString()}
                              </span>
                              {product.discountPercentage > 0 && (
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                  ${product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.matchReason && (
                              <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                {product.matchReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-[#B88E2F] hover:bg-[#9f7924] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
                            >
                              <FiShoppingBag className="text-[11px]" />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite(product.id, product.title)
                              }
                              aria-label="Toggle favorite"
                              className={`p-1.5 rounded-lg border transition-colors ${
                                fav
                                  ? "bg-red-50 border-red-200 text-red-500"
                                  : "border-[#E6D5BD] text-gray-600 hover:text-red-500"
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
                              onClick={onClose}
                              className="p-1.5 rounded-lg border border-[#E6D5BD] text-gray-600 hover:text-[#B88E2F]"
                              title="View Product"
                            >
                              <FiExternalLink className="text-xs" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
