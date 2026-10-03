import { z } from 'zod';
import { STAGES } from '@/domain/framework/constants';
import { PrivateApiError } from './private-api';

const projectSummary = z.object({
  id: z.uuid(), name: z.string().min(1).max(160),
  stage: z.enum(STAGES), updated_at: z.iso.datetime({ offset: true }),
});

export function readProjectsResponse(value: unknown) {
  const result = z.object({ projects: z.array(projectSummary).max(100) }).safeParse(value);
  if (!result.success) throw new PrivateApiError('Não conseguimos abrir a lista de projetos. Tente atualizar novamente.', null);
  return result.data.projects;
}

export function readCreatedProject(value: unknown) {
  const result = z.object({ project: z.object({ id: z.uuid() }) }).safeParse(value);
  if (!result.success) throw new PrivateApiError('Não conseguimos confirmar qual projeto foi criado.', null);
  return result.data.project;
}
