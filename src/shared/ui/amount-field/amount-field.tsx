"use client";

import { type ChangeEvent, useLayoutEffect, useRef } from "react";

import { formatAmountInput } from "@/shared/lib/format-amount";

import { TextField, type TextFieldProps } from "../text-field";

interface AmountFieldProps extends Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode"
> {
  value: string;
  onValueChange: (value: string) => void;
}

/** 천 단위 쉼표를 표시하며 부모에는 원 단위 숫자 문자열을 전달합니다. */
export function AmountField({ value, onValueChange, ...props }: AmountFieldProps) {
  const pendingSelection = useRef<{ input: HTMLInputElement; position: number } | null>(null);

  useLayoutEffect(() => {
    const selection = pendingSelection.current;
    if (!selection) return;
    selection.input.setSelectionRange(selection.position, selection.position);
    pendingSelection.current = null;
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const digitsAfterCaret = raw.slice(caret).replace(/[^0-9]/g, "").length;
    const formatted = formatAmountInput(raw);
    let position = formatted.length;
    let remaining = digitsAfterCaret;
    while (position > 0 && remaining > 0) {
      position -= 1;
      if (/[0-9]/.test(formatted[position])) remaining -= 1;
    }
    const digits = formatted.replace(/,/g, "");
    if (digits === value) {
      if (
        "inputType" in event.nativeEvent &&
        event.nativeEvent.inputType === "deleteContentBackward" &&
        formatted[position - 1] === ","
      ) {
        position -= 1;
      }
      input.value = formatted;
      input.setSelectionRange(position, position);
      pendingSelection.current = null;
      return;
    }
    pendingSelection.current = { input, position };
    onValueChange(digits);
  }

  return (
    <TextField
      {...props}
      type="text"
      inputMode="numeric"
      value={formatAmountInput(value)}
      onChange={handleChange}
    />
  );
}
