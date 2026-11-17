"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  useId,
  useState,
  useTransition,
} from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { DropdownS } from "@/shared/ui/dropdown-s";
import { Radio } from "@/shared/ui/radio";
import { TextField } from "@/shared/ui/text-field";

import { createSignupFormSchema, FIRST_BIRTH_YEAR } from "../model/signup-form.schema";

const phoneFields = [
  { name: "phone-prefix", label: "연락처 앞자리", placeholder: "010", maxLength: 3 },
  { name: "phone-middle", label: "연락처 가운데 자리", placeholder: "0000", maxLength: 4 },
  { name: "phone-last", label: "연락처 끝자리", placeholder: "0000", maxLength: 4 },
] as const;

const genderOptions = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

type SignupField = keyof ReturnType<typeof createSignupFormSchema>["shape"];

const fieldLabel = "mb-2 text-sm leading-[1.4] font-medium text-grayscale-600";
const fieldErrorText = "mt-2 px-1 text-[13px] leading-[1.4] font-medium text-system-error";

function keepActiveYearVisible(event: KeyboardEvent<HTMLDivElement>) {
  if (!["ArrowUp", "ArrowDown", "Home", "End", "Enter", " "].includes(event.key)) return;
  const combobox = event.currentTarget.querySelector('[role="combobox"]');
  requestAnimationFrame(() => {
    const activeId = combobox?.getAttribute("aria-activedescendant");
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  });
}

interface SignupFormProps {
  currentYear: number;
  successHref: string;
}

export function SignupForm({ currentYear, successHref }: SignupFormProps) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<[string, string, string]>(["", "", ""]);
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Partial<Record<SignupField, boolean>>>({});
  const [isSubmitting, startTransition] = useTransition();

  const birthYearOptions = [
    { value: "", label: "출생연도 선택" },
    ...Array.from({ length: currentYear - FIRST_BIRTH_YEAR + 1 }, (_, index) => {
      const year = currentYear - index;
      return { value: String(year), label: `${year}년` };
    }),
  ];
  const parsed = createSignupFormSchema(currentYear).safeParse({
    name,
    phone,
    birthYear,
    gender,
    email,
  });
  const fieldError = (field: SignupField) =>
    touched[field] && !parsed.success
      ? parsed.error.issues.find((issue) => issue.path[0] === field)?.message
      : undefined;
  const phoneError = fieldError("phone");
  const birthYearError = fieldError("birthYear");
  const genderError = fieldError("gender");

  function handleFieldBlur(field: SignupField) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  function handleGroupBlur(event: FocusEvent<HTMLFieldSetElement>, field: SignupField) {
    if (!event.currentTarget.contains(event.relatedTarget)) handleFieldBlur(field);
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const input = event.currentTarget;
    const digits = input.value.replace(/\D/g, "").slice(0, input.maxLength);
    setPhone((previous) => {
      const next: typeof previous = [...previous];
      next[index] = digits;
      return next;
    });

    const nextField = phoneFields[index + 1];
    if (nextField && digits.length === input.maxLength) {
      const nextInput = input.form?.elements.namedItem(nextField.name);
      if (nextInput instanceof HTMLInputElement) nextInput.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsed.success || isSubmitting) return;
    startTransition(() => router.replace(successHref));
  }

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
      <fieldset className="min-w-0" disabled={isSubmitting}>
        <legend className="mb-3 w-full border-b border-grayscale-200 pb-2 text-headline-2 font-semibold text-grayscale-900">
          필수 회원정보
        </legend>
        <div className="flex flex-col gap-1">
          <TextField
            label="이름"
            name="name"
            autoComplete="name"
            placeholder="이름을 입력해 주세요"
            required
            value={name}
            error={fieldError("name")}
            className="min-h-[102px]"
            onChange={(event) => setName(event.target.value)}
            onBlur={() => handleFieldBlur("name")}
          />

          <fieldset
            className="min-h-[102px] min-w-0"
            onBlur={(event) => handleGroupBlur(event, "phone")}
          >
            <legend className={fieldLabel}>연락처</legend>
            <div className="grid grid-cols-3 gap-2">
              {phoneFields.map(({ name, label, placeholder, maxLength }, index) => (
                <TextField
                  key={name}
                  name={name}
                  type="tel"
                  inputMode="numeric"
                  maxLength={maxLength}
                  placeholder={placeholder}
                  aria-label={label}
                  aria-describedby={phoneError ? `${id}-phone-error` : undefined}
                  required
                  value={phone[index]}
                  className="min-w-0"
                  onChange={(event) => handlePhoneChange(event, index)}
                />
              ))}
            </div>
            {phoneError && (
              <p id={`${id}-phone-error`} className={fieldErrorText}>
                {phoneError}
              </p>
            )}
          </fieldset>

          <fieldset
            className="min-h-[102px] min-w-0"
            aria-describedby={birthYearError ? `${id}-year-error` : undefined}
            onBlur={() => handleFieldBlur("birthYear")}
          >
            <legend className={fieldLabel}>출생연도</legend>
            <div onKeyDown={keepActiveYearVisible}>
              <DropdownS
                aria-label={birthYear ? `출생연도 ${birthYear}년` : "출생연도 선택"}
                value={birthYear}
                options={birthYearOptions}
                onChange={setBirthYear}
                className="w-full [&>button]:h-12 [&>button]:w-full [&>button]:justify-between [&>button]:text-base [&>ul]:max-h-60 [&>ul]:w-full [&>ul]:overflow-y-auto"
              />
            </div>
            {birthYearError && (
              <p id={`${id}-year-error`} className={fieldErrorText}>
                {birthYearError}
              </p>
            )}
          </fieldset>

          <fieldset
            className="min-h-[76px]"
            aria-describedby={genderError ? `${id}-gender-error` : undefined}
            onBlur={(event) => handleGroupBlur(event, "gender")}
          >
            <legend className={fieldLabel}>성별</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {genderOptions.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-1">
                  <Radio
                    id={`${id}-${value}`}
                    name="gender"
                    value={value}
                    required
                    checked={gender === value}
                    className="rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500"
                    onChange={() => setGender(value)}
                  />
                  <label
                    htmlFor={`${id}-${value}`}
                    className="cursor-pointer text-sm font-medium text-grayscale-800"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
            {genderError && (
              <p id={`${id}-gender-error`} className={fieldErrorText}>
                {genderError}
              </p>
            )}
          </fieldset>
        </div>
      </fieldset>

      <fieldset className="min-w-0" disabled={isSubmitting}>
        <legend className="mb-3 w-full border-b border-grayscale-200 pb-2 text-headline-2 font-semibold text-grayscale-900">
          선택 회원정보
        </legend>
        <TextField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          value={email}
          error={fieldError("email")}
          className="min-h-[102px]"
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => handleFieldBlur("email")}
        />
      </fieldset>

      <BtnCta
        type="submit"
        size="l"
        className="w-full"
        disabled={!parsed.success}
        loading={isSubmitting}
      >
        가입하기
      </BtnCta>
    </form>
  );
}
