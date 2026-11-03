"use client";

import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { FiSend, FiCheckCircle } from "react-icons/fi";

const ContactForm = () => {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      showToast({ message: "Please enter your name", type: "error" });
      return;
    }
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      showToast({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }
    if (!trimmedMessage) {
      showToast({
        message: "Please include a message so we can assist you",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      showToast({
        message: "Message sent! Our team will reply within 24 hours.",
        type: "success",
      });
    }, 400);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs">
      {submitted && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-800 text-sm">
          <div className="flex items-center gap-2.5">
            <FiCheckCircle className="text-emerald-600 text-lg shrink-0" />
            <span>
              Thank you for reaching out! A Furniro specialist will be in touch
              shortly.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-name"
              className="text-sm font-semibold text-gray-800"
            >
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-[#B88E2F] outline-none py-3.5 px-4 rounded-xl w-full transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-email"
              className="text-sm font-semibold text-gray-800"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-[#B88E2F] outline-none py-3.5 px-4 rounded-xl w-full transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-subject"
            className="text-sm font-semibold text-gray-800"
          >
            Subject <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Custom sizing, order status, or interior consultation"
            className="text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-[#B88E2F] outline-none py-3.5 px-4 rounded-xl w-full transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-message"
            className="text-sm font-semibold text-gray-800"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can our furniture specialists help you today?"
            className="text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-[#B88E2F] outline-none py-3.5 px-4 rounded-xl w-full transition-colors resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 text-white text-sm sm:text-base font-semibold bg-[#B88E2F] hover:bg-[#9f7924] rounded-xl px-10 py-3.5 shadow-sm transition-colors disabled:opacity-60"
        >
          <FiSend />
          <span>{submitting ? "Sending..." : "Send Message"}</span>
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
