"use client";

import React from "react";

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
};

export default function Skeleton({ className = "", width, height, rounded = true }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={
        `bg-gray-200/70 dark:bg-gray-700/60 animate-pulse ${rounded ? "rounded-md" : ""} ` +
        className
      }
      style={style}
      aria-hidden
    />
  );
}
