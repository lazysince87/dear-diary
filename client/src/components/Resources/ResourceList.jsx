import { ExternalLink, Phone, MessageCircle, Globe } from "lucide-react";

const RESOURCES = [
  {
    id: "hotline",
    name: "National Domestic Violence Hotline",
    description:
      "24/7 support for anyone affected by domestic violence. Confidential and free.",
    phone: "1-800-799-7233",
    url: "https://www.thehotline.org",
    icon: <Phone size={20} />,
    color: "bg-rose-50 border-rose-200/40",
    iconColor: "text-rose-500",
  },
  {
    id: "text",
    name: "Crisis Text Line",
    description:
      "Text HOME to 741741 to connect with a trained crisis counselor. Free, 24/7.",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    icon: <MessageCircle size={20} />,
    color: "bg-sage-light/30 border-sage/20",
    iconColor: "text-sage-dark",
  },
  {
    id: "loveisrespect",
    name: "Love Is Respect",
    description:
      "Resources specifically for young people experiencing dating abuse. Chat, text, or call.",
    phone: "1-866-331-9474",
    url: "https://www.loveisrespect.org",
    icon: <Globe size={20} />,
    color: "bg-warm-100 border-warm-300/40",
    iconColor: "text-warm-500",
  },
  {
    id: "rainn",
    name: "RAINN",
    description:
      "Nation's largest anti-sexual violence organization. Free, confidential support 24/7.",
    phone: "1-800-656-4673",
    url: "https://www.rainn.org",
    icon: <Phone size={20} />,
    color: "bg-dusty-rose-light/30 border-dusty-rose/20",
    iconColor: "text-dusty-rose-dark",
  },
];

// const SAFETY_TIPS = [
//     'Trust your instincts, if something feels wrong, it probably is.',
//     'You deserve to be treated with kindness and respect.',
//     'Isolation is a tactic, not a reflection of your worth.',
//     'Keeping a journal can help you see patterns over time.',
//     "It's okay to ask for help. Reaching out is a sign of strength.",
//     'Your feelings are valid, even if someone tries to tell you otherwise.',
// ];

export default function ResourceList() {
  return (
    <div className="animate-fade-in">
      {/* Resources */}
      <div className="space-y-4 mb-8">
        {RESOURCES.map((resource) => (
          <div
            key={resource.id}
            className={`p-5 md:p-6 rounded-lg bg-cream/55`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2.5 rounded-full bg-white/60 ${resource.iconColor}`}
              >
                {resource.icon}
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold text-text-primary text-lg mb-1"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {resource.name}
                </h3>
                <p className="text-text-secondary text-sm mb-3 leading-relaxed">
                  {resource.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${resource.phone.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Phone size={14} />
                    {resource.phone}
                  </a>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <ExternalLink size={14} />
                    Visit website
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety tips */}
      {/* <div className="p-6 md:p-8">
                <h3
                    className="text-xl font-semibold text-text-primary mb-4"
                    style={{ fontFamily: 'var(--font-serif)' }}
                >
                    Remember...
                </h3>
                <ul className="space-y-3">
                    {SAFETY_TIPS.map((tip, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-3 text-text-secondary text-sm leading-relaxed animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <span className="text-dusty-rose mt-0.5">*</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div> */}
    </div>
  );
}
