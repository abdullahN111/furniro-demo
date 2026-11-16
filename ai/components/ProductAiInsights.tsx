"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiCheckCircle,
  FiInfo,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { AiReviewInsightsResponse } from "@ai/types";

interface ProductAiInsightsProps {
  productId: string;
  productTitle: string;
  reviewCount: number;
}

const PRODUCT_QA_CHIPS = [
  "Does it fit a small apartment?",
  "How is the build quality & durability?",
  "Is assembly quick and easy?",
  "What styles & colors pair well with this?",
];

export default function ProductAiInsights({
  productId,
  productTitle,
  reviewCount,
}: ProductAiInsightsProps) {
  const [insights, setInsights] = useState<AiReviewInsightsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/review-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = (await res.json()) as AiReviewInsightsResponse;
        setInsights(data);
      }
    } catch (err) {
      console.error("Failed to load AI review insights:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights, reviewCount]);

  const handleAskQuestion = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed || asking) return;

    setAsking(true);
    setAskedQuestion(trimmed);
    setQuestion("");

    try {
      const res = await fetch("/api/ai/review-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          question: trimmed,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as AiReviewInsightsResponse;
        setQaAnswer(
          data.answer ||
            `${productTitle} is crafted with durable materials and balanced proportions ideal for modern spaces.`
        );
      }
    } catch (err) {
      console.error("Failed to ask product AI question:", err);
    } finally {
      setAsking(false);
    }
  };

  const openInFullChatbot = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("furniro:open-ai-chat", {
          detail: {
            prompt: `Tell me more about ${productTitle} and what furniture pairs well with it.`,
          },
        })
      );
    }
  };

  return (
    <div className="mb-10 rounded-2xl border border-[#e8d8c3] bg-gradient-to-br from-[#FCF8F3] via-white to-[#F9F1E7]/60 p-6 sm:p-8 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#efe3d2]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#B88E2F] text-white flex items-center justify-center shadow-xs">
            <HiSparkles className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                AI Customer Insights &amp; Product Q&amp;A
              </h3>
              {insights && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B88E2F]/15 text-[#B88E2F]">
                  {insights.overallSentiment}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Synthesized by Furniro AI from verified buyer reviews &amp;
              product specifications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openInFullChatbot}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88E2F] hover:text-white bg-white hover:bg-[#B88E2F] border border-[#B88E2F] px-3.5 py-2 rounded-full transition-colors"
        >
          <FiMessageCircle />
          Open in AI Concierge
        </button>
      </div>

      {/* Review Synthesis Body */}
      {loading ? (
        <div className="py-6 space-y-3 animate-pulse">
          <div className="h-4 bg-[#efe3d2] rounded w-3/4" />
          <div className="h-4 bg-[#efe3d2] rounded w-1/2" />
        </div>
      ) : (
        insights && (
          <div className="pt-5 space-y-5">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {insights.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros / Highlights */}
              <div className="bg-white/90 border border-[#eee0cd] rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5 flex items-center gap-1.5">
                  <FiCheckCircle />
                  What Shoppers &amp; Stylists Highlight
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                  {insights.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Considerations & Best For */}
              <div className="bg-white/90 border border-[#eee0cd] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#B88E2F] mb-2.5 flex items-center gap-1.5">
                    <FiInfo />
                    Placement &amp; Care Notes
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                    {insights.considerations.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#B88E2F] font-bold mt-0.5">
                          •
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-500 mr-1">
                    Best For:
                  </span>
                  {insights.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium bg-[#FCF8F3] text-[#B88E2F] border border-[#e9dac6] px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Ask AI About This Product (Amazon Rufus style) */}
      <div className="mt-6 pt-5 border-t border-[#efe3d2]">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
          Have a specific question about {productTitle}? Ask AI:
        </p>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRODUCT_QA_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={asking}
              onClick={() => handleAskQuestion(chip)}
              className="text-xs font-medium bg-white hover:bg-[#F9F1E7] text-gray-700 hover:text-[#B88E2F] border border-[#e5d5be] px-3 py-1.5 rounded-full transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Custom Question Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(question);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask anything about ${productTitle}...`}
            disabled={asking}
            className="flex-1 text-xs sm:text-sm bg-white border border-[#decbb0] focus:border-[#B88E2F] rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="inline-flex items-center gap-1.5 bg-[#B88E2F] hover:bg-[#9f7924] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors"
          >
            <FiSend />
            <span>{asking ? "Asking..." : "Ask AI"}</span>
          </button>
        </form>

        {/* Instant Answer Box */}
        {(asking || qaAnswer) && (
          <div className="mt-3 bg-white border border-[#e2cfa9] rounded-xl p-4 text-xs sm:text-sm">
            {askedQuestion && (
              <p className="font-semibold text-gray-900 mb-1">
                Q: {askedQuestion}
              </p>
            )}
            {asking ? (
              <p className="text-gray-500 animate-pulse">
                Furniro AI is analyzing {productTitle} details...
              </p>
            ) : (
              <p className="text-gray-700 leading-relaxed">{qaAnswer}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
