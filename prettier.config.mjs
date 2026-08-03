/**
 * Prettier 설정
 *
 * 포맷 규칙은 전부 Prettier가 담당하고, ESLint는 코드 품질만 봅니다
 * (eslint.config.mjs 마지막의 eslint-config-prettier가 겹치는 규칙을 끕니다).
 *
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",

  plugins: ["prettier-plugin-tailwindcss"],

  /*
   * Tailwind v4는 설정이 CSS에 있어서 진입점을 알려줘야 클래스 정렬이 됩니다.
   * 커스텀 토큰(text-heading-1 등)도 이 파일을 읽어야 인식합니다.
   */
  tailwindStylesheet: "./src/app/globals.css",

  /** cn()·clsx() 안에 있는 클래스 문자열도 정렬 대상에 포함합니다. */
  tailwindFunctions: ["cn", "clsx"],
};

export default config;
