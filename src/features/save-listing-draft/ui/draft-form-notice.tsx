"use client";

import { useState } from "react";

export function DraftFormNotice({
  status,
  error,
  warnings,
}: {
  status: string;
  error: string | null;
  warnings: readonly string[];
}) {
  const [recoveryWarnings] = useState(warnings);
  return (
    <div className="min-h-12 space-y-2 text-sm">
      <p role="status" className="text-grayscale-600">
        {status}
      </p>
      {recoveryWarnings.map((warning) => (
        <p key={warning} role="alert" className="text-system-error">
          {warning}
        </p>
      ))}
      {error && (
        <p role="alert" className="text-system-error">
          {error}
        </p>
      )}
    </div>
  );
}
