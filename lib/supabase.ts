/**
 * Zero-dependency Supabase PostgREST + Storage REST client built on native fetch.
 * Compatible with Next.js 14 Server Components, API routes, and Vercel serverless functions.
 */

export interface SupabaseResult<T = unknown> {
  data: T | null;
  error: { message: string; status?: number } | null;
  count?: number | null;
}

type FilterOp = { col: string; op: string; val: string };

class PostgrestQueryBuilder implements PromiseLike<SupabaseResult<any>> {
  private baseUrl: string;
  private apiKey: string;
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private selectCols = "*";
  private headOnly = false;
  private wantCount = false;
  private filters: FilterOp[] = [];
  private orders: string[] = [];
  private limitNum: number | null = null;
  private bodyPayload: unknown = null;
  private preferHeaders: string[] = [];
  private onConflictCol: string | null = null;
  private expectSingle: "none" | "single" | "maybeSingle" = "none";

  constructor(baseUrl: string, apiKey: string, table: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.table = table;
  }

  select(columns = "*", options?: { count?: "exact"; head?: boolean }): this {
    this.selectCols = columns;
    if (options?.count === "exact") {
      this.wantCount = true;
      this.preferHeaders.push("count=exact");
    }
    if (options?.head) {
      this.headOnly = true;
    }
    if (this.method === "POST" || this.method === "PATCH") {
      this.preferHeaders.push("return=representation");
    }
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]): this {
    this.method = "POST";
    this.bodyPayload = values;
    return this;
  }

  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    options?: { onConflict?: string }
  ): this {
    this.method = "POST";
    this.bodyPayload = values;
    this.preferHeaders.push("resolution=merge-duplicates");
    if (options?.onConflict) {
      this.onConflictCol = options.onConflict;
    }
    return this;
  }

  update(values: Record<string, unknown>): this {
    this.method = "PATCH";
    this.bodyPayload = values;
    return this;
  }

  eq(col: string, val: string | number | boolean): this {
    this.filters.push({ col, op: "eq", val: String(val) });
    return this;
  }

  gte(col: string, val: string | number): this {
    this.filters.push({ col, op: "gte", val: String(val) });
    return this;
  }

  order(
    col: string,
    options?: { ascending?: boolean; nullsFirst?: boolean }
  ): this {
    const dir = options?.ascending === false ? "desc" : "asc";
    const nulls =
      options?.nullsFirst === false
        ? ".nullslast"
        : options?.nullsFirst === true
          ? ".nullsfirst"
          : "";
    this.orders.push(`${col}.${dir}${nulls}`);
    return this;
  }

  limit(n: number): this {
    this.limitNum = n;
    return this;
  }

  single(): this {
    this.expectSingle = "single";
    return this;
  }

  maybeSingle(): this {
    this.expectSingle = "maybeSingle";
    return this;
  }

  private async execute(): Promise<SupabaseResult<any>> {
    try {
      const url = new URL(`${this.baseUrl}/rest/v1/${this.table}`);

      if (this.method === "GET" || this.selectCols !== "*") {
        url.searchParams.set("select", this.selectCols);
      }
      if (this.onConflictCol) {
        url.searchParams.set("on_conflict", this.onConflictCol);
      }
      for (const f of this.filters) {
        url.searchParams.append(f.col, `${f.op}.${f.val}`);
      }
      if (this.orders.length > 0) {
        url.searchParams.set("order", this.orders.join(","));
      }
      if (this.limitNum !== null) {
        url.searchParams.set("limit", String(this.limitNum));
      }

      const headers: Record<string, string> = {
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      };

      if (this.bodyPayload !== null) {
        headers["Content-Type"] = "application/json";
      }

      const prefers = Array.from(new Set(this.preferHeaders));
      if (prefers.length > 0) {
        headers["Prefer"] = prefers.join(",");
      }

      const httpMethod = this.headOnly ? "HEAD" : this.method;
      const res = await fetch(url.toString(), {
        method: httpMethod,
        headers,
        body: this.bodyPayload !== null ? JSON.stringify(this.bodyPayload) : undefined,
        cache: "no-store",
      });

      let count: number | null = null;
      const contentRange = res.headers.get("content-range");
      if (contentRange && contentRange.includes("/")) {
        const total = Number(contentRange.split("/")[1]);
        if (!Number.isNaN(total)) count = total;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let message = `Supabase HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(errText);
          message = parsed.message || parsed.error_description || parsed.hint || message;
        } catch {
          if (errText) message = `${message}: ${errText.slice(0, 200)}`;
        }
        return { data: null, error: { message, status: res.status }, count };
      }

      if (this.headOnly || res.status === 204) {
        return { data: null, error: null, count };
      }

      const text = await res.text();
      if (!text) {
        return { data: null, error: null, count };
      }

      const parsed = JSON.parse(text);

      if (this.expectSingle === "single") {
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            return { data: null, error: { message: "No rows returned" }, count };
          }
          return { data: parsed[0], error: null, count };
        }
        return { data: parsed, error: null, count };
      }

      if (this.expectSingle === "maybeSingle") {
        if (Array.isArray(parsed)) {
          return { data: parsed[0] ?? null, error: null, count };
        }
        return { data: parsed ?? null, error: null, count };
      }

      return { data: parsed, error: null, count };
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : String(err) },
        count: null,
      };
    }
  }

  then<TResult1 = SupabaseResult<any>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class StorageClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  async getBucket(id: string): Promise<SupabaseResult<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/storage/v1/bucket/${encodeURIComponent(id)}`, {
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: "no-store",
      });
      if (!res.ok) return { data: null, error: { message: `HTTP ${res.status}` } };
      return { data: await res.json(), error: null };
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
    }
  }

  async createBucket(
    id: string,
    options?: { public?: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] }
  ): Promise<SupabaseResult<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/storage/v1/bucket`, {
        method: "POST",
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: id,
          public: options?.public ?? true,
          file_size_limit: options?.fileSizeLimit,
          allowed_mime_types: options?.allowedMimeTypes,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { data: null, error: { message: text || `HTTP ${res.status}` } };
      }
      return { data: await res.json().catch(() => ({ id })), error: null };
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
    }
  }

  from(bucket: string) {
    const baseUrl = this.baseUrl;
    const apiKey = this.apiKey;
    return {
      async upload(
        filePath: string,
        fileBody: Buffer | Uint8Array,
        options?: { contentType?: string; cacheControl?: string; upsert?: boolean }
      ): Promise<SupabaseResult<{ path: string }>> {
        try {
          const cleanPath = filePath.replace(/^\/+/, "");
          const res = await fetch(
            `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${cleanPath}`,
            {
              method: "POST",
              headers: {
                apikey: apiKey,
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": options?.contentType || "application/octet-stream",
                "x-upsert": options?.upsert ? "true" : "false",
                "cache-control": `max-age=${options?.cacheControl || "3600"}`,
              },
              body: new Uint8Array(fileBody),
            }
          );

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            return {
              data: null,
              error: { message: text || `Storage upload HTTP ${res.status}` },
            };
          }

          return { data: { path: cleanPath }, error: null };
        } catch (err) {
          return {
            data: null,
            error: { message: err instanceof Error ? err.message : String(err) },
          };
        }
      },

      getPublicUrl(filePath: string): { data: { publicUrl: string } } {
        const cleanPath = filePath.replace(/^\/+/, "");
        return {
          data: {
            publicUrl: `${baseUrl}/storage/v1/object/public/${encodeURIComponent(
              bucket
            )}/${cleanPath}`,
          },
        };
      },
    };
  }
}

export class LightweightSupabaseClient {
  private baseUrl: string;
  private apiKey: string;
  public storage: StorageClient;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.storage = new StorageClient(this.baseUrl, this.apiKey);
  }

  from(table: string): PostgrestQueryBuilder {
    return new PostgrestQueryBuilder(this.baseUrl, this.apiKey, table);
  }
}

let cachedPublicClient: LightweightSupabaseClient | null = null;
let cachedAdminClient: LightweightSupabaseClient | null = null;

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function isSupabasePublicConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabasePublic(): LightweightSupabaseClient | null {
  if (!isSupabasePublicConfigured()) return null;
  if (!cachedPublicClient) {
    cachedPublicClient = new LightweightSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return cachedPublicClient;
}

export function getSupabaseAdmin(): LightweightSupabaseClient {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Supabase admin credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }
  if (!cachedAdminClient) {
    cachedAdminClient = new LightweightSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return cachedAdminClient;
}
