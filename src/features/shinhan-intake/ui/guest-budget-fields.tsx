"use client";

import { type CSSProperties, useId } from "react";

import styles from "./guest-budget-fields.module.css";

interface BudgetFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
}

interface BudgetNumberProps extends BudgetFieldProps {
  label: string;
  id: string;
}

function BudgetNumber({ value, onChange, label, id, error }: BudgetNumberProps) {
  return (
    <div className={styles.numberField}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.amount}>
        <input
          id={id}
          type="number"
          min={20}
          max={100}
          step={1}
          inputMode="numeric"
          value={value === null ? "" : value / 10000}
          placeholder="선택"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : event.target.valueAsNumber * 10000)
          }
        />
        <span>만 원</span>
      </div>
    </div>
  );
}

interface BudgetSliderProps extends BudgetFieldProps {
  label: string;
  unselectedValue: number;
  className?: string;
}

function BudgetSlider({ value, onChange, label, unselectedValue, className }: BudgetSliderProps) {
  return (
    <input
      type="range"
      min={200000}
      max={1000000}
      step={10000}
      className={className}
      aria-label={label}
      aria-valuetext={value === null ? "아직 선택하지 않음" : `${value / 10000}만 원`}
      value={value ?? unselectedValue}
      onChange={(event) => onChange(Number(event.target.value))}
      onPointerUp={(event) => onChange(Number(event.currentTarget.value))}
      onKeyUp={(event) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key))
          onChange(Number(event.currentTarget.value));
      }}
    />
  );
}

export function ShinhanGuestBudgetField({ value, onChange, error }: BudgetFieldProps) {
  const id = useId();
  const percent = ((value ?? 200000) - 200000) / 8000;
  return (
    <div className={styles.budget}>
      <BudgetNumber
        id={id}
        label="한 달 월세 예산이 얼마인가요?"
        value={value}
        onChange={onChange}
        error={error}
      />
      <div
        className={styles.singleTrack}
        style={{ "--budget-end": `${Math.max(0, Math.min(100, percent))}%` } as CSSProperties}
      >
        <BudgetSlider
          label="한 달 월세 예산 조절"
          value={value}
          onChange={onChange}
          unselectedValue={200000}
        />
      </div>
      <div className={styles.bounds}>
        <span>20만 원</span>
        <span>100만 원 이상</span>
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface BudgetRangeProps {
  min: number | null;
  max: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  minError?: string;
  maxError?: string;
}

export function ShinhanGuestBudgetRangeField({
  min,
  max,
  onMinChange,
  onMaxChange,
  minError,
  maxError,
}: BudgetRangeProps) {
  const id = useId();
  const start = Math.max(0, Math.min(100, ((min ?? 200000) - 200000) / 8000));
  const end = Math.max(0, Math.min(100, ((max ?? 1000000) - 200000) / 8000));
  return (
    <fieldset className={styles.budget}>
      <legend className={styles.legend}>2. 월세는 얼마를 생각하세요?</legend>
      <div className={styles.rangeNumbers}>
        <BudgetNumber
          id={`${id}-min`}
          label="최소 월세"
          value={min}
          onChange={onMinChange}
          error={minError}
        />
        <span aria-hidden="true" className={styles.separator}>
          ~
        </span>
        <BudgetNumber
          id={`${id}-max`}
          label="최대 월세"
          value={max}
          onChange={onMaxChange}
          error={maxError}
        />
      </div>
      <div
        className={styles.rangeTrack}
        style={
          {
            "--budget-start": `${Math.min(start, end)}%`,
            "--budget-end": `${Math.max(start, end)}%`,
          } as CSSProperties
        }
      >
        <BudgetSlider
          label="최소 월세 조절"
          value={min}
          onChange={onMinChange}
          unselectedValue={200000}
        />
        <BudgetSlider
          label="최대 월세 조절"
          value={max}
          onChange={onMaxChange}
          unselectedValue={1000000}
        />
      </div>
      <div className={styles.bounds}>
        <span>20만 원</span>
        <span>100만 원 이상</span>
      </div>
      <p className={styles.hint}>각각 1만 원 단위로 선택해 주세요. 같은 금액도 가능해요.</p>
      {minError && (
        <p id={`${id}-min-error`} className={styles.error} role="alert">
          {minError}
        </p>
      )}
      {maxError && (
        <p id={`${id}-max-error`} className={styles.error} role="alert">
          {maxError}
        </p>
      )}
    </fieldset>
  );
}
