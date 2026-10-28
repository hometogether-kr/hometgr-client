"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { AddressSearchDialog } from "@/shared/ui/address-search-dialog";
import { Calendar } from "@/shared/ui/calendar";
import { Icon } from "@/shared/ui/icons";

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
  const [open, setOpen] = useState(false);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className={styles.region}>
      <label id={`${id}-label`} htmlFor={id} className={styles.label}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className={styles.dateButton}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-describedby={error ? `${id}-error` : undefined}
        data-error={Boolean(error) || undefined}
        onClick={() => setOpen(true)}
      >
        <span id={`${id}-value`} className={value ? undefined : styles.placeholder}>
          {value || "희망하는 시·구·동 검색"}
        </span>
        <span className={styles.calendarIcon} aria-hidden="true">
          <Icon name="search" size={22} />
        </span>
      </button>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      <AddressSearchDialog
        open={open}
        onClose={close}
        onSelect={(address) => onChange(address.address)}
      />
    </div>
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

interface MoveInTimingProps extends GuestConditionFieldProps {
  timing?: "ASAP" | "WITHIN_MONTH" | "DATE";
  onTimingChange: (timing: "ASAP" | "WITHIN_MONTH" | "DATE", date: string) => void;
  compact?: boolean;
}
export function ShinhanMoveInTimingField({
  value,
  timing = "ASAP",
  onChange,
  onTimingChange,
  error,
  compact = false,
}: MoveInTimingProps) {
  const id = useId();
  return (
    <fieldset className={styles.timing} data-compact={compact}>
      <legend>언제쯤 입주하고 싶으세요?</legend>
      <div className={styles.timingChoices}>
        {(["ASAP", "WITHIN_MONTH", "DATE"] as const).map((option) => (
          <label key={option} className={styles.timingChoice}>
            <input
              type="radio"
              name={`${id}-timing`}
              checked={timing === option}
              onChange={() => {
                onTimingChange(option, "");
              }}
            />
            <span>
              {option === "ASAP"
                ? compact
                  ? "빠른 입주"
                  : "가능한 한 빨리"
                : option === "WITHIN_MONTH"
                  ? compact
                    ? "1개월 내"
                    : "1개월 이내"
                  : compact
                    ? "직접 입력"
                    : "직접 입력하기"}
            </span>
          </label>
        ))}
      </div>
      {timing === "DATE" && (
        <ShinhanMoveInDateField value={value} onChange={onChange} error={error} />
      )}
      {timing !== "DATE" && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
