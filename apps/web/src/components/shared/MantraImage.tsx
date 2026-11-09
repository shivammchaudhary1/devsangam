'use client';

import { type ImgHTMLAttributes, useId, useState } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string };
export function MantraImage({
  src,
  fallbackSrc,
  alt = 'Mantra artwork',
  className,
  onError,
  ...props
}: Props) {
  const [failed, setFailed] = useState<string[]>([]);
  const id = useId();
  const source = [typeof src === 'string' ? src : undefined, fallbackSrc].find(
    (value) => value && !failed.includes(value),
  );
  if (source)
    return (
      <img
        {...props}
        src={source}
        alt={alt}
        className={className}
        onError={(event) => {
          setFailed((values) => [...values, source]);
          onError?.(event);
        }}
      />
    );
  return (
    <div role="img" aria-label={alt} className={className} data-mantra-placeholder="true">
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={id}>
            <stop stopColor="#293127" />
            <stop offset="1" stopColor="#101c29" />
          </radialGradient>
        </defs>
        <rect width="240" height="240" fill={`url(#${id})`} />
        <g fill="none" stroke="#cda762" strokeWidth="0.7" opacity="0.4">
          <circle cx="120" cy="120" r="80" />
          <circle cx="120" cy="120" r="66" />
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="120"
              cy="99"
              rx="18"
              ry="38"
              transform={`rotate(${i * 45} 120 120)`}
            />
          ))}
        </g>
        <circle cx="120" cy="120" r="32" fill="#15202c" stroke="#cda762" strokeWidth="0.8" />
        <text
          x="120"
          y="134"
          textAnchor="middle"
          fill="#ddc491"
          fontSize="38"
          fontFamily="'Noto Serif Devanagari', serif"
        >
          ॐ
        </text>
      </svg>
    </div>
  );
}
