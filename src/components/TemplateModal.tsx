import { useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import type { ScreenTemplate } from "@/types";

const TEMPLATES: ScreenTemplate[] = [
  {
    id: "welcome",
    name: "Welcome",
    description: "Intro screen with headline and CTA",
    icon: "👋",
    components: [
      {
        type: "badge",
        order: 0,
        props: { text: "NEW", bgColor: "#7c3aed", color: "#ffffff" },
      },
      { type: "spacer", order: 1, props: { height: 12 } },
      {
        type: "heading",
        order: 2,
        props: {
          text: "Welcome to the Program",
          align: "center",
          color: "#ffffff",
          fontSize: 28,
          fontWeight: "bold",
        },
      },
      {
        type: "paragraph",
        order: 3,
        props: {
          text: "Answer a few quick questions to get your personalized plan.",
          align: "center",
          color: "#9ca3af",
          fontSize: 15,
        },
      },
      { type: "spacer", order: 4, props: { height: 16 } },
      {
        type: "button",
        order: 5,
        props: {
          text: "Get Started →",
          bgColor: "#7c3aed",
          color: "#ffffff",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "quiz-question",
    name: "Quiz Question",
    description: "Multiple choice with answers",
    icon: "❓",
    components: [
      {
        type: "progress",
        order: 0,
        props: { label: "Step 1 of 5", value: 20 },
      },
      { type: "spacer", order: 1, props: { height: 20 } },
      {
        type: "heading",
        order: 2,
        props: {
          text: "What is your main goal?",
          align: "center",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: "bold",
        },
      },
      { type: "spacer", order: 3, props: { height: 16 } },
      { type: "section", order: 4, props: { title: "Answer Options" } },
      {
        type: "button",
        order: 5,
        props: {
          text: "🏃 Lose weight",
          bgColor: "#1e1b2e",
          color: "#e5e7eb",
          size: "lg",
        },
      },
      {
        type: "button",
        order: 6,
        props: {
          text: "💪 Build muscle",
          bgColor: "#1e1b2e",
          color: "#e5e7eb",
          size: "lg",
        },
      },
      {
        type: "button",
        order: 7,
        props: {
          text: "🧘 Flexibility",
          bgColor: "#1e1b2e",
          color: "#e5e7eb",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "results",
    name: "Results",
    description: "Personalized results reveal",
    icon: "🎯",
    components: [
      {
        type: "badge",
        order: 0,
        props: {
          text: "Your Plan is Ready",
          bgColor: "#059669",
          color: "#ffffff",
        },
      },
      { type: "spacer", order: 1, props: { height: 8 } },
      {
        type: "heading",
        order: 2,
        props: {
          text: "Here's Your Plan",
          align: "center",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: "bold",
        },
      },
      {
        type: "paragraph",
        order: 3,
        props: {
          text: "Based on your answers, we've created a custom plan for you.",
          align: "center",
          color: "#9ca3af",
          fontSize: 14,
        },
      },
      { type: "spacer", order: 4, props: { height: 12 } },
      {
        type: "list",
        order: 5,
        props: {
          items: [
            "Custom workout schedule",
            "Personalized meal plan",
            "24/7 coach support",
          ],
          color: "#e5e7eb",
          fontSize: 14,
        },
      },
      { type: "spacer", order: 6, props: { height: 16 } },
      {
        type: "button",
        order: 7,
        props: {
          text: "Start My Journey",
          bgColor: "#7c3aed",
          color: "#ffffff",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "paywall",
    name: "Paywall",
    description: "Pricing / subscription screen",
    icon: "💳",
    components: [
      {
        type: "heading",
        order: 0,
        props: {
          text: "Choose Your Plan",
          align: "center",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: "bold",
        },
      },
      {
        type: "paragraph",
        order: 1,
        props: {
          text: "Join thousands who already transformed their life.",
          align: "center",
          color: "#9ca3af",
          fontSize: 14,
        },
      },
      { type: "spacer", order: 2, props: { height: 16 } },
      {
        type: "badge",
        order: 3,
        props: {
          text: "🔥 Most Popular",
          bgColor: "#7c3aed",
          color: "#ffffff",
        },
      },
      {
        type: "heading",
        order: 4,
        props: {
          text: "$9.99 / month",
          align: "center",
          color: "#ffffff",
          fontSize: 28,
          fontWeight: "bold",
        },
      },
      {
        type: "list",
        order: 5,
        props: {
          items: [
            "Unlimited access",
            "Personalized plans",
            "Expert coaching",
            "Cancel anytime",
          ],
          color: "#e5e7eb",
          fontSize: 13,
        },
      },
      { type: "spacer", order: 6, props: { height: 12 } },
      {
        type: "button",
        order: 7,
        props: {
          text: "Start Free Trial",
          bgColor: "#7c3aed",
          color: "#ffffff",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "email-capture",
    name: "Email Capture",
    description: "Lead gen with email input",
    icon: "📧",
    components: [
      {
        type: "heading",
        order: 0,
        props: {
          text: "Get Your Free Guide",
          align: "center",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: "bold",
        },
      },
      {
        type: "paragraph",
        order: 1,
        props: {
          text: "Enter your email and we'll send you the plan instantly.",
          align: "center",
          color: "#9ca3af",
          fontSize: 14,
        },
      },
      { type: "spacer", order: 2, props: { height: 20 } },
      {
        type: "input",
        order: 3,
        props: { label: "Email address", placeholder: "you@example.com" },
      },
      { type: "spacer", order: 4, props: { height: 8 } },
      {
        type: "checkbox",
        order: 5,
        props: { label: "I agree to receive emails and updates" },
      },
      { type: "spacer", order: 6, props: { height: 12 } },
      {
        type: "button",
        order: 7,
        props: {
          text: "Send Me the Guide",
          bgColor: "#7c3aed",
          color: "#ffffff",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "blank",
    name: "Blank",
    description: "Empty screen — start from scratch",
    icon: "✦",
    components: [],
  },
];

export function TemplateModal({ onClose }: { onClose: () => void }) {
  const { addScreenFromTemplate } = useBuilder();
  const [hovered, setHovered] = useState<string | null>(null);

  const pick = (t: ScreenTemplate) => {
    addScreenFromTemplate(t);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col"
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: 560,
          maxHeight: "80vh",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between"
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <p
              style={{
                color: "var(--text-primary)",
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Add Screen
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                margin: "2px 0 0",
              }}
            >
              Choose a template or start blank
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: "16px 24px 24px",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => pick(t)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                textAlign: "left",
                background:
                  hovered === t.id ? "var(--card-bg-hover)" : "var(--card-bg)",
                border: `1.5px solid ${
                  hovered === t.id ? "var(--border-active)" : "var(--border)"
                }`,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  marginBottom: 12,
                  height: 44,
                  justifyContent: "center",
                }}
              >
                {t.components.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <span style={{ fontSize: 20, color: "var(--text-faint)" }}>
                      +
                    </span>
                  </div>
                ) : (
                  t.components.slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        height:
                          c.type === "heading"
                            ? 8
                            : c.type === "button"
                            ? 10
                            : c.type === "section"
                            ? 6
                            : 5,
                        borderRadius: 2,
                        background:
                          c.type === "button"
                            ? "var(--accent-soft)"
                            : c.type === "badge"
                            ? "var(--accent-soft)"
                            : "var(--bg-hover)",
                        width:
                          c.type === "heading"
                            ? "75%"
                            : c.type === "paragraph"
                            ? "90%"
                            : c.type === "button"
                            ? "60%"
                            : "50%",
                      }}
                    />
                  ))
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <div>
                  <p
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      color: "var(--text-faint)",
                      fontSize: 10,
                      margin: "1px 0 0",
                    }}
                  >
                    {t.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
