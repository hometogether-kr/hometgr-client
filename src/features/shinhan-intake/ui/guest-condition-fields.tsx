"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Calendar } from "@/shared/ui/calendar";
import { Icon } from "@/shared/ui/icons";
import { TextField } from "@/shared/ui/text-field";

import {
  formatShinhanCalendarDate,
  getShinhanTodayDate,
  parseShinhanCalendarDate,
} from "../model/guest-date";

import styles from "./guest-condition-fields.module.css";

interface GuestConditionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface GuestRegionFieldProps extends GuestConditionFieldProps {
  label?: string;
}

export function ShinhanGuestRegionField({
  value,
  onChange,
  error,
  label = "희망 위치",
}: GuestRegionFieldProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="지역, 역, 학교 주변 등 자유롭게 입력해 주세요."
      maxLength={200}
      autoComplete="off"
      error={error}
      className={styles.region}
    />
  );
}

export function ShinhanMoveInDateField({ value, onChange, error }: GuestConditionFieldProps) {
  const fieldId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = parseShinhanCalendarDate(value);
  const today = parseShinhanCalendarDate(getShinhanTodayDate());

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !fieldRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isOpen]);

  const closeCalendar = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={fieldRef}
      className={styles.dateField}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          closeCalendar();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setIsOpen(false);
        }
      }}
    >
      <label id={`${fieldId}-label`} htmlFor={fieldId} className={styles.label}>
        희망 입주일
      </label>
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        className={styles.dateButton}
        data-error={Boolean(error) || undefined}
        aria-labelledby={`${fieldId}-label ${fieldId}-value`}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-controls={`${fieldId}-calendar`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span id={`${fieldId}-value`} className={value ? undefined : styles.placeholder}>
          {value || "입주일을 선택해 주세요."}
        </span>
        <span aria-hidden="true" className={styles.calendarIcon}>
          <Icon name="calendar_today" size={20} />
        </span>
      </button>
      {error && (
        <p id={`${fieldId}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {isOpen && (
        <div id={`${fieldId}-calendar`} className={styles.calendarPanel}>
          <Calendar
            mode="single"
            required
            autoFocus
            selected={selected}
            today={today}
            defaultMonth={selected ?? today}
            startMonth={today}
            disabled={today ? { before: today } : undefined}
            onSelect={(date) => {
              onChange(formatShinhanCalendarDate(date));
              closeCalendar();
            }}
          />
          <button type="button" className={styles.closeButton} onClick={closeCalendar}>
            달력 닫기
          </button>
        </div>
      )}
    </div>
  );
}
