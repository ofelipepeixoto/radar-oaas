import { useEffect, useRef } from 'react';
import { z } from 'zod';

const sectionSchema = z.enum(['canvas', 'evidence', 'ratings', 'operation', 'economics', 'report', 'experiments']);
type Section = z.infer<typeof sectionSchema>;
type Tool = {
  name: string; title: string; description: string; inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type ContextDocument = Document & { modelContext?: { registerTool(tool: Tool, options: { signal: AbortSignal }): void | Promise<void> } };

/** Agent actions share the visible workbench state; no hidden writes or data access. */
export function useWorkbenchTools(status: object, navigate: (section: Section) => void) {
  const state = useRef({ status, navigate });
  state.current = { status, navigate };
  useEffect(() => {
    const context = (document as ContextDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Tool) => {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); }
      catch { /* The browser's optional agent interface never blocks the workbench. */ }
    };
    register({
      name: 'read_assessment_status', title: 'Ler estado da avaliação',
      description: 'Lê modo, estágio, contagens e existência de alterações não salvas; não recalcula nem grava uma avaliação.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) { z.object({}).strict().parse(input); return structuredClone(state.current.status); },
    });
    register({
      name: 'navigate_assessment_section', title: 'Abrir seção da avaliação',
      description: 'Abre uma seção visível do avaliador. Não salva, não gera diagnóstico e não altera os dados.',
      inputSchema: { type: 'object', properties: { section: { type: 'string', enum: sectionSchema.options } }, required: ['section'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const { section } = z.object({ section: sectionSchema }).strict().parse(input);
        state.current.navigate(section);
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        return { section, saved: false };
      },
    });
    return () => lifecycle.abort();
  }, []);
}
