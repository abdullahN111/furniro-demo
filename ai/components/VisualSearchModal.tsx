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
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#F6EFE6] rounded-2xl shadow-2xl border-2 border-[#B88E2F] overflow-hidden my-6 max-h-[88vh] flex flex-col"
      >
        {/* Dark Espresso Header */}
        <div className="bg-[#1C1917] border-b border-[#B88E2F]/40 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B88E2F] text-white flex items-center justify-center shadow-md">
              <FiCamera className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  AI Visual Search — Snap &amp; Style Match
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#B88E2F] text-white px-2.5 py-0.5 rounded-full">
                  <HiSparkles />
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-[#D6C7B2]">
                Upload a photo of any room or furniture piece to find matching
                Furniro items.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close visual search modal"
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Upload Dropzone & Style Note */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
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
                className="cursor-pointer h-full min-h-[190px] border-2 border-dashed border-[#B88E2F]/60 hover:border-[#B88E2F] bg-[#EDE2D3] hover:bg-[#E7D8C5] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all"
              >
                {previewUrl ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded room"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-[#1C1917]/85 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                      Click to change photo
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#1C1917] text-[#B88E2F] flex items-center justify-center mb-3 shadow-md">
                      <FiUploadCloud className="text-2xl" />
                    </div>
                    <p className="text-sm font-bold text-[#1C1917]">
                      Drop your room or furniture photo here, or{" "}
                      <span className="text-[#B88E2F] underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Supports JPG, PNG, WebP up to 4MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Instant Room Inspiration Presets + Optional Hint */}
            <div className="md:col-span-5 flex flex-col justify-between bg-[#EAE0D2] rounded-2xl p-4 border border-[#D5C3AA]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6E5634] mb-2">
                  Or Try a Sample Room Style
                </p>
                <div className="space-y-2">
                  {SAMPLE_VISUAL_SEARCH_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        selectedPresetId === preset.id
                          ? "border-[#B88E2F] bg-[#1C1917] text-white shadow-sm"
                          : "border-[#D5C3AA] bg-[#FBF7F2] hover:border-[#B88E2F] text-gray-900"
                      }`}
                    >
                      <p className="font-bold">{preset.label}</p>
                      <p
                        className={`text-[11px] line-clamp-1 mt-0.5 ${
                          selectedPresetId === preset.id
                            ? "text-[#D6C7B2]"
                            : "text-gray-600"
                        }`}
                      >
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#D5C3AA]">
                <label className="text-[11px] font-bold text-[#1C1917] block mb-1">
                  Optional Focus Note
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customHint}
                    onChange={(e) => setCustomHint(e.target.value)}
                    placeholder="e.g. dining chair, wooden table..."
                    className="flex-1 text-xs bg-[#FBF7F2] border border-[#CBB698] rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-[#B88E2F]"
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
                      className="text-xs font-semibold bg-[#B88E2F] hover:bg-[#9f7924] text-white px-3 py-1.5 rounded-lg transition-colors"
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
            <div className="py-10 text-center space-y-2 bg-[#EDE2D3] rounded-2xl border border-[#D5C3AA]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1C1917] text-[#B88E2F] animate-pulse">
                <HiSparkles className="text-xl" />
              </div>
              <p className="text-sm font-bold text-[#1C1917]">
                Analyzing furniture silhouette, materials &amp; color palette...
              </p>
              <p className="text-xs text-gray-600">
                Matching against live Furniro Sanity inventory
              </p>
            </div>
          )}

          {/* Results Section */}
          {!loading && result && (
            <div className="space-y-4">
              {/* Detected Style Summary Banner */}
              <div className="bg-[#1C1917] text-white border border-[#B88E2F]/50 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E5C168]">
                      Detected Aesthetic:
                    </span>
                    <span className="text-sm font-bold text-white">
                      {result.detectedStyle}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.colorPalette.map((color) => (
                      <span
                        key={color}
                        className="text-[11px] font-medium bg-[#2C2622] border border-[#B88E2F]/40 text-[#F3EAE0] px-2.5 py-0.5 rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#D6C7B2] leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Matched Products Grid */}
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] mb-3">
                  Closest Matching Pieces ({result.products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {result.products.map((product) => {
                    const fav = isFavorite(product.id);
                    return (
                      <div
                        key={product.id}
                        className="border border-[#D5C3AA] hover:border-[#B88E2F] rounded-xl p-3 flex gap-3.5 bg-[#FBF7F2] shadow-sm transition-all"
                      >
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0"
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
                              className="text-sm font-bold text-[#1C1917] hover:text-[#B88E2F] truncate block"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-bold text-[#B88E2F]">
                                ${product.finalPrice.toLocaleString()}
                              </span>
                              {product.discountPercentage > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.matchReason && (
                              <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                                {product.matchReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-[#B88E2F] hover:bg-[#9f7924] text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <FiShoppingBag className="text-xs" />
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite(product.id, product.title)
                              }
                              aria-label="Toggle favorite"
                              className={`p-1.5 rounded-lg border transition-colors ${
                                fav
                                  ? "bg-red-50 border-red-300 text-red-500"
                                  : "border-[#D5C3AA] text-gray-600 hover:text-red-500"
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
                              className="p-1.5 rounded-lg border border-[#D5C3AA] text-gray-600 hover:text-[#B88E2F]"
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
