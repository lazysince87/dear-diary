import { X, AlertTriangle, Heart, CheckCircle } from "lucide-react";

export default function PatternDetail({ pattern, onClose }) {
  if (!pattern) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 md:p-8 animate-slide-up"
        style={{
          background: "#fffaf7",
          border: "1px solid #e8d5c4",
          boxShadow: "6px 6px 0 #e0c4c4",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-warm-200/50 transition-colors"
        >
          <X size={20} className="text-text-muted" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {/* <span className="text-4xl">{pattern.icon}</span> */}
          <div>
            <h2
              className="text-2xl font-bold text-text-primary"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {pattern.name}
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                pattern.severity === "high"
                  ? "bg-rose-100 text-rose-600"
                  : pattern.severity === "medium"
                    ? "bg-warm-200 text-warm-500"
                    : "bg-sage-light text-sage-dark"
              }`}
            >
              {pattern.severity} severity
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed mb-6">
          {pattern.description}
        </p>

        {/* Warning signs */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rose-500" />
            <h3 className="font-semibold text-text-primary text-sm">
              Warning Signs
            </h3>
          </div>
          <ul className="space-y-2">
            {pattern.signs?.map((sign, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="text-rose-400 mt-0.5">•</span>
                {sign}
              </li>
            ))}
          </ul>
        </div>

        {/* Examples */}
        {pattern.examples?.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-dusty-rose" />
              <h3 className="font-semibold text-text-primary text-sm">
                What it might sound like
              </h3>
            </div>
            <div className="space-y-2">
              {pattern.examples.map((example, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-warm-100/50 text-sm text-text-secondary italic"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Healthy alternative */}
        {pattern.healthyAlternative && (
          <div className="p-4 rounded-xl bg-sage-light/20 border border-sage/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-sage-dark" />
              <h3 className="font-semibold text-sage-dark text-sm">
                What healthy looks like
              </h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {pattern.healthyAlternative}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
