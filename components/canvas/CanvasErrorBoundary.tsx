"use client";

import React, { Component, ReactNode } from "react";

interface CanvasErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates WebGL shader compile failures or context initialization crashes inside `<Canvas>`
 * so semantic DOM content and static SVG fallbacks continue working uninterrupted.
 */
export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  public state: CanvasErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    this.props.onError?.(error);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
