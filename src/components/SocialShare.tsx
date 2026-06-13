interface SocialShareProps {
  /** Custom message to share (where supported). Defaults to a generic SmartCut message. */
  message?: string;
  /** URL to share. Defaults to current location origin. */
  url?: string;
  /** Show small text labels next to icons. */
  showLabels?: boolean;
  /** Optional heading above the buttons. */
  heading?: string;
  className?: string;
}

// Brand SVG logos — recognizable and version-independent
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.307 1.265.49 1.697.628.713.226 1.362.194 1.875.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.69a8.16 8.16 0 004.77 1.52V6.81a4.85 4.85 0 01-1.84-.12z"/>
  </svg>
);

const socialLinks = [
  {
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    href: "https://www.whatsapp.com/",
    hover: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
  },
  {
    name: "Facebook",
    Icon: FacebookIcon,
    href: "https://www.facebook.com/",
    hover: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
  },
  {
    name: "Instagram",
    Icon: InstagramIcon,
    href: "https://www.instagram.com/smartcut1000?igsh=Zzl6enBweHNwejV5",
    hover: "hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5] hover:text-white hover:border-transparent",
  },
  {
    name: "TikTok",
    Icon: TikTokIcon,
    href: "https://www.tiktok.com/",
    hover: "hover:bg-foreground hover:text-background hover:border-foreground",
  },
];

const SocialShare = ({
  message = "I just tried SmartCut to find my perfect haircut! 💇✨",
  url,
  showLabels = false,
  heading,
  className = "",
}: SocialShareProps) => {
  void message;
  void url;

  return (
    <div className={className}>
      {heading && (
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">{heading}</p>
      )}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {socialLinks.map(({ name, Icon, href, hover }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer external"
            onClick={(e) => {
              e.preventDefault();
              window.open(href, "_blank", "noopener,noreferrer");
            }}
            aria-label={`Share on ${name}`}
            title={`Share on ${name}`}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-foreground transition-all duration-200 shadow-soft ${hover}`}
          >
            <Icon className="w-4 h-4" />
            {showLabels && <span className="text-xs font-medium">{name}</span>}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialShare;
