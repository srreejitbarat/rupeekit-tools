'use client';

import Image from 'next/image';

interface LogoProps {
  type?: 'horizontal' | 'icon';
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ type = 'horizontal', width, height, className = '' }: LogoProps) {
  if (type === 'icon') {
    return (
      <Image
        src="/brand/rupeekit_icon_from_social_logo_transparent_square.png"
        alt="RupeeKit Icon"
        width={width ?? 40}
        height={height ?? 40}
        className={`object-contain ${className}`}
        priority
      />
    );
  }

  return (
    <Image
      src="/brand/rupeekit_logo_horizontal_transparent.png?v=20260817"
      alt="RupeeKit Logo"
      width={width ?? 160}
      height={height ?? 40}
      className={`object-contain ${className}`}
      priority
    />
  );
}
