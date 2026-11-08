"use client";

import { useState } from "react";

/** Publish changes in the input event; never infer user edits from an effect. */
export function useDraftFormValues<T extends object>(
  initialValues: T,
  onChange?: (values: T) => void,
) {
  const [values, setValues] = useState(initialValues);
  const update = (patch: Partial<T>) => {
    const next = { ...values, ...patch };
    setValues(next);
    onChange?.(next);
  };
  return { values, update };
}
