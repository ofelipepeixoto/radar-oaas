import type { APIRoute } from "astro";
import * as handlers from "@/server-api/projects/[id]/export/route";
export const prerender = false;
export const GET: APIRoute = ({ request, params }) => handlers.GET(request, { params: Promise.resolve({ id: params.id! }) });
