import type { APIRoute } from "astro";
import * as handlers from "@/server-api/analysis/route";
export const prerender = false;
export const POST: APIRoute = ({ request }) => handlers.POST(request);
