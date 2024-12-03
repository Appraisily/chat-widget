import React from 'react';

interface ImageKitProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

const IMAGEKIT_URL = 'https://ik.imagekit.io/appraisily';

export default function ImageKit({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy'
}: ImageKitProps) {
  // Remove any leading slash from the source path
  const imagePath = src.replace(/^\//, '');
  
  return (
    <picture>
      <source
        srcSet={`${IMAGEKIT_URL}/tr:w-${width},h-${height},f-webp/${imagePath}`}
        type="image/webp"
      />
      <img
        src={`${IMAGEKIT_URL}/tr:w-${width},h-${height}/${imagePath}`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
      />
    </picture>
  );
}