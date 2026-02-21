import { ChevronRight } from "lucide-react";

const SEVERITY_COLORS = {
  low: "bg-sage-light/30 border-sage/30",
  medium: "bg-warm-100 border-warm-300",
  high: "bg-rose-50/60 border-rose-200/40",
};

export default function PatternCard({ pattern, onClick }) {
  return (
    <button
      onClick={() => onClick?.(pattern)}
      className="w-full text-left p-2 md:p-2 transition-all duration-300 group cursor-pointer border-0 animate-fade-in"
    >
      <div className="flex items-start gap-4 bg-cream/55 rounded-lg p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="font-semibold text-text-primary text-lg"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {pattern.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${pattern.severity === "high"
                ? "bg-rose-100 text-rose-600"
                : pattern.severity === "medium"
                  ? "bg-warm-200 text-warm-500"
                  : "bg-sage-light text-sage-dark"
                }`}
            >
              {pattern.severity}
            </span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {pattern.description}
          </p>
          {pattern.signs?.[0] && (
            <p className="mt-2 text-xs text-text-muted italic">
              Example: {pattern.signs[0]}
            </p>
          )}
        </div>
        <ChevronRight
          size={20}
          className="text-text-muted flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </button>
  );
}
