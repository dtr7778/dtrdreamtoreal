import * as React from "react"

type ImageProps = {
  src: string | { src: string }
  alt: string
  width?: number
  height?: number
  style?: React.CSSProperties
  className?: string
  [key: string]: unknown // absorbs next/image-only props like unoptimized, fill, priority
}

export default function NextImageMock({
  src,
  alt,
  width,
  height,
  style,
  className,
}: ImageProps) {
  const imgSrc = typeof src === "string" ? src : src.src
  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      style={style}
      className={className}
    />
  )
}
