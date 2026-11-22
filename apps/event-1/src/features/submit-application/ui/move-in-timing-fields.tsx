import styles from "./application-flow.module.css";

interface MoveInTimingFieldsProps {
  year: string;
  month: string;
  period: string;
  error?: string;
  onChange: (field: "moveInYear" | "moveInMonth" | "moveInPeriod", value: string) => void;
}

export function MoveInTimingFields({
  year,
  month,
  period,
  error,
  onChange,
}: MoveInTimingFieldsProps) {
  return (
    <fieldset className={styles.moveInTiming} aria-describedby="move-in-help">
      <legend>
        희망 입주 시점 <span>(필수)</span>
      </legend>
      <div className={styles.moveInControls}>
        <div className={styles.yearControl}>
          <input
            id="move-in-year"
            name="moveInYear"
            aria-label="희망 입주 연도"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="년도"
            maxLength={4}
            required
            value={year}
            aria-invalid={!!error}
            aria-describedby="move-in-help"
            onChange={(event) =>
              onChange("moveInYear", event.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
          <span aria-hidden="true">년</span>
        </div>
        <select
          id="move-in-month"
          name="moveInMonth"
          aria-label="희망 입주 월"
          required
          value={month}
          aria-invalid={!!error}
          aria-describedby="move-in-help"
          onChange={(event) => onChange("moveInMonth", event.target.value)}
        >
          <option value="" disabled>
            월
          </option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}월
            </option>
          ))}
        </select>
        <select
          id="move-in-period"
          name="moveInPeriod"
          aria-label="희망 입주 시기"
          required
          value={period}
          aria-invalid={!!error}
          aria-describedby="move-in-help"
          onChange={(event) => onChange("moveInPeriod", event.target.value)}
        >
          <option value="" disabled>
            시기
          </option>
          <option value="early">초</option>
          <option value="mid">중순</option>
          <option value="late">말</option>
        </select>
      </div>
      <p id="move-in-help" className={error ? styles.error : styles.helper}>
        {error || "예: 2027년 3월 초"}
      </p>
    </fieldset>
  );
}
