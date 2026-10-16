import Image from "next/image";

export default function Logo({
  className = "h-9 w-9",
  preload = false,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src="/voltcorelogo.png"
      alt="VoltCore logo"
      width={40}
      height={40}
      preload={preload}
      className={`shrink-0 rounded-xl object-contain ${className}`}
    />
  );
}
