import { STANDALONE_MODE } from "./app-config";
import { handleStandaloneApi } from "./standalone-api";

/** Единая точка запросов: сервер или localStorage в standalone */
export async function apiClient(input: string, init?: RequestInit): Promise<Response> {
  if (STANDALONE_MODE && input.startsWith("/api/")) {
    return handleStandaloneApi(input, init);
  }
  return fetch(input, init);
}
