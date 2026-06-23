const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function buildUrl(path) {
  return `${supabaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const headers = new Headers(options.headers ?? {});
  headers.set("apikey", supabaseAnonKey);
  headers.set("Authorization", `Bearer ${supabaseAnonKey}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export async function uploadSupabaseObject(bucket, filePath, file) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(
    buildUrl(`/storage/v1/object/${bucket}/${filePath}`),
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: file,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase storage upload failed: ${response.status}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
