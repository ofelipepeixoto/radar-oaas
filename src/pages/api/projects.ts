import type { APIRoute } from "astro";
import * as handlers from "@/server-api/projects/route";
export const prerender = false;
export const GET: APIRoute = ({ request }) => handlers.GET(request);
export const POST: APIRoute = ({ request }) => handlers.POST(request);
