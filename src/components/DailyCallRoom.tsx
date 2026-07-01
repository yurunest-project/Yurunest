"use client";

import DailyIframe from "@daily-co/daily-js";
import { useEffect, useRef, useState } from "react";

type DailyCallRoomProps = {
  roomUrl: string;
};

export function DailyCallRoom({ roomUrl }: DailyCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frame = DailyIframe.createFrame(container, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "12px",
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    });

    frame
      .join({ url: roomUrl })
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
        setError(
          "通話ルームに接続できませんでした。URLが正しいか、有効期限内かご確認ください。",
        );
      });

    return () => {
      frame.destroy();
    };
  }, [roomUrl]);

  if (error) {
    return (
      <p className="rounded-2xl border border-sage/20 bg-white px-5 py-6 text-base leading-relaxed text-forest-muted">
        {error}
      </p>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <p className="mb-4 text-center text-base text-forest-muted">
          通話ルームに接続しています…
        </p>
      )}
      <div
        ref={containerRef}
        className="h-[min(70vh,520px)] w-full overflow-hidden rounded-2xl bg-forest/5"
      />
    </div>
  );
}
