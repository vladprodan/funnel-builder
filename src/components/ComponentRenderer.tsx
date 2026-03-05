import type { CanvasComponent } from "@/types";

interface Props {
  component: CanvasComponent;
  isSelected: boolean;
}

export function ComponentRenderer({ component, isSelected }: Props) {
  const { type, props } = component;

  const el = (() => {
    switch (type) {
      case "heading":
        return (
          <div
            style={{
              textAlign: props.align || "left",
              color: props.color || "#ffffff",
              fontSize: props.fontSize || 24,
              fontWeight: props.fontWeight || "bold",
              lineHeight: 1.2,
            }}
          >
            {props.text || "Heading"}
          </div>
        );

      case "subheading":
        return (
          <div
            style={{
              textAlign: props.align || "left",
              color: props.color || "#e5e7eb",
              fontSize: props.fontSize || 18,
              fontWeight: props.fontWeight || "600",
              lineHeight: 1.3,
            }}
          >
            {props.text || "Subheading"}
          </div>
        );

      case "paragraph":
        return (
          <div
            style={{
              textAlign: props.align || "left",
              color: props.color || "#9ca3af",
              fontSize: props.fontSize || 14,
              lineHeight: 1.6,
            }}
          >
            {props.text || "Paragraph text"}
          </div>
        );

      case "button":
        return (
          <div style={{ textAlign: "center" }}>
            <button
              style={{
                backgroundColor: props.bgColor || "#7c3aed",
                color: props.color || "#ffffff",
                fontSize:
                  props.size === "lg" ? 16 : props.size === "sm" ? 12 : 14,
                padding:
                  props.size === "lg"
                    ? "12px 28px"
                    : props.size === "sm"
                    ? "6px 14px"
                    : "9px 20px",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "inline-block",
                letterSpacing: "0.01em",
              }}
            >
              {props.text || "Button"}
            </button>
          </div>
        );

      case "input":
        return (
          <div className="flex flex-col gap-1.5">
            {props.label && (
              <label
                style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 500 }}
              >
                {props.label}
              </label>
            )}
            <input
              readOnly
              placeholder={props.placeholder || "Enter value..."}
              style={{
                backgroundColor: "#1f2937",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "#9ca3af",
                fontSize: 14,
                width: "100%",
                outline: "none",
              }}
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-start gap-2.5">
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: "1.5px solid rgba(255,255,255,0.2)",
                backgroundColor: "#1f2937",
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <span style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.5 }}>
              {props.label || "Checkbox label"}
            </span>
          </div>
        );

      case "divider":
        return (
          <div
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 1,
            }}
          />
        );

      case "spacer":
        return (
          <div
            style={{ height: props.height || 24, position: "relative" }}
            className="flex items-center justify-center"
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: isSelected
                  ? "1px dashed rgba(124,58,237,0.4)"
                  : "1px dashed transparent",
                borderRadius: 4,
              }}
            >
              {isSelected && (
                <span
                  style={{
                    color: "#7c3aed",
                    fontSize: 10,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  {props.height || 24}px spacer
                </span>
              )}
            </div>
          </div>
        );

      case "badge":
        return (
          <div>
            <span
              style={{
                backgroundColor: props.bgColor || "#7c3aed",
                color: props.color || "#ffffff",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 100,
                display: "inline-block",
                letterSpacing: "0.03em",
              }}
            >
              {props.text || "Badge"}
            </span>
          </div>
        );

      case "list":
        return (
          <ul
            style={{
              padding: 0,
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {(props.items || ["Item 1", "Item 2", "Item 3"]).map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: props.color || "#e5e7eb",
                  fontSize: props.fontSize || 14,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#7c3aed",
                    flexShrink: 0,
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        );

      case "progress":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span style={{ color: "#e5e7eb", fontSize: 13 }}>
                {props.label || "Progress"}
              </span>
              <span style={{ color: "#7c3aed", fontSize: 13, fontWeight: 600 }}>
                {props.value || 0}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${props.value || 0}%`,
                  background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div
            style={{
              height: props.height || 160,
              backgroundColor: "#1f2937",
              borderRadius: 8,
              border: "1px dashed rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {props.src ? (
              <img
                src={props.src}
                alt={props.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                  Image placeholder
                </span>
              </>
            )}
          </div>
        );

      case "section":
        return (
          <div
            style={{
              border: "1.5px dashed rgba(124,58,237,0.35)",
              borderRadius: 10,
              padding: "8px 10px",
              background: "rgba(124,58,237,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#7c3aed",
                  opacity: 0.7,
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {props.title || "Section"}
              </span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.15)",
                fontSize: 10,
                paddingLeft: 9,
              }}
            >
              Group label — drag components below this
            </div>
          </div>
        );

      default:
        return (
          <div className="text-white/30 text-sm">Unknown component: {type}</div>
        );
    }
  })();

  return <div className="w-full">{el}</div>;
}
