import type { APIRoute } from "astro";
import * as handlers from "@/server-api/projects/[id]/assessments/route";
export const prerender = false;
export const GET: APIRoute = ({ request, params }) => handlers.GET(request, { params: Promise.resolve({ id: params.id! }) });
export const POST: APIRoute = ({ request, params }) => handlers.POST(request, { params: Promise.resolve({ id: params.id! }) });
