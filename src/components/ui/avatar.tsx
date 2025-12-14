import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: "w-6 h-6", text: "text-xs" },
  sm: { container: "w-8 h-8", text: "text-sm" },
  md: { container: "w-10 h-10", text: "text-base" },
  lg: { container: "w-12 h-12", text: "text-lg" },
  xl: { container: "w-16 h-16", text: "text-xl" },
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  const styles = sizeStyles[size];

  // Generate initials from fallback or alt
  const initials =
    fallback ||
    alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (src) {
    return (
      <div
        className={`
          ${styles.container}
          relative rounded-full overflow-hidden
          bg-slate-700
          ${className}
        `}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${styles.container}
        rounded-full
        bg-gradient-to-br from-emerald-500 to-emerald-700
        flex items-center justify-center
        ${styles.text} font-bold text-white
        ${className}
      `}
    >
      {initials}
    </div>
  );
}

