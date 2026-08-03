import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

/**
 * 타입 정보를 읽는 규칙은 src의 TS 파일에만 적용합니다.
 * 설정 파일(*.mjs)까지 포함하면 TS 프로젝트에 속하지 않아 파싱 오류가 납니다.
 */
const TYPED_FILES = ["src/**/*.ts", "src/**/*.tsx"];

/**
 * Feature-Sliced Design 레이어 (AGENTS.md 참고)
 *
 * 배열 순서가 곧 의존 방향입니다. 위 레이어는 아래 레이어만 참조할 수 있습니다.
 */
const FSD_LAYERS = ["app", "pages-layer", "widgets", "features", "domains", "shared"];

/** 각 레이어가 참조할 수 있는 하위 레이어 정책 */
const downwardPolicies = FSD_LAYERS.slice(0, -1).map((layer, index) => ({
  from: { element: { type: layer } },
  allow: { to: { element: { types: FSD_LAYERS.slice(index + 1) } } },
}));

/**
 * 같은 레이어 안 다른 슬라이스 참조
 *
 * AGENTS.md는 이를 피하라고 하지만, 지금 코드에 합성 위젯(site-layout →
 * responsive-header → navigation 등)이 여럿 있어 우선 허용합니다.
 * 정리한 뒤 이 정책을 지우면 바로 강제됩니다.
 */
const sameLayerPolicies = FSD_LAYERS.map((layer) => ({
  from: { element: { type: layer } },
  allow: { to: { element: { type: layer } } },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  /*
   * 타입 기반 규칙 (no-floating-promises, no-misused-promises, no-unsafe-* 등).
   * 타입 정보를 읽느라 lint가 느려지는 대신, API·Zod 경계에서 놓치기 쉬운
   * Promise 처리 실수를 잡아줍니다.
   */
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: TYPED_FILES,
  })),
  {
    files: TYPED_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      /*
       * import 자동 정렬. 그룹은 사이드 이펙트 → 외부 패키지 → @/ 별칭 →
       * 상대경로 → 스타일 순입니다. eslint --fix로 정리됩니다.
       */
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:", "^@?\\w"],
            ["^@/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },

  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      /*
       * 슬라이스 폴더 하나가 element 하나입니다. app만 Next.js 라우트 구조라
       * 레이어 전체를 하나의 element로 봅니다.
       */
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages-layer", pattern: "src/pages-layer/*" },
        { type: "widgets", pattern: "src/widgets/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "domains", pattern: "src/domains/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
    },
    rules: {
      /* 레이어 역방향 의존 금지 (AGENTS.md "Dependencies must only flow downward") */
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            ...downwardPolicies,
            ...sameLayerPolicies,
            /* 외부 패키지는 어디서나 사용 가능 */
            { allow: { to: { module: { origin: "external" } } } },
          ],
        },
      ],
    },
  },

  /* 포맷 관련 ESLint 규칙을 끕니다. 반드시 마지막 설정이어야 합니다. */
  prettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
