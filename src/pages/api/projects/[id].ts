import type { APIRoute } from "astro";
import * as handlers from "@/server-api/projects/[id]/route";
export const prerender = false;
export const GET: APIRoute = ({ request, params }) => handlers.GET(request, { params: Promise.resolve({ id: params.id! }) });
export const PUT: APIRoute = ({ request, params }) => handlers.PUT(request, { params: Promise.resolve({ id: params.id! }) });
export const DELETE: APIRoute = ({ request, params }) => handlers.DELETE(request, { params: Promise.resolve({ id: params.id! }) });
