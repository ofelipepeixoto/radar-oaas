import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  { files: ['src/components/ui/**/*.{ts,tsx}'], rules: { '@typescript-eslint/no-unused-vars': 'off' } },
);
