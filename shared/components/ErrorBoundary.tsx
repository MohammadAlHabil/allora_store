"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Toaster } from "@/shared/components/ui/sonner";
import { logger } from "@/shared/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error({
      message: "React ErrorBoundary",
      error: error.message,
      stack: error.stack,
      info,
    });
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);

      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-gray-600 mt-2">{this.state.error.message}</p>
            <button onClick={this.reset} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
              Try again
            </button>
          </div>
          <Toaster />
        </div>
      );
    }

    return this.props.children;
  }
}
