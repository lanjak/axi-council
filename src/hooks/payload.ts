export interface HookPayload {
  harness?: string;
  cwd?: string;
  sessionId?: string;
  files?: string[];
  event?: string;
}

// Best-effort parsing of whatever JSON a harness pipes in. Unknown shapes and
// non-JSON input yield an empty payload - never an error. Key candidates are
// scanned loosely; this is a documented maintenance surface, not a contract.
export function parseHookPayload(stdinJson: string): HookPayload {
  let obj: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(stdinJson);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    obj = parsed as Record<string, unknown>;
  } catch {
    return {};
  }

  const payload: HookPayload = {};

  payload.sessionId =
    str(obj.session_id) ??
    str(obj.sessionId) ??
    str(record(obj.session)?.id);

  payload.cwd =
    str(obj.cwd) ??
    str(record(obj.workspace)?.cwd);

  payload.event =
    str(obj.hook_event_name) ??
    str(obj.event);

  payload.harness =
    str(obj.harness) ??
    str(obj.agent) ??
    (obj.hook_event_name !== undefined ? 'claude-code' : undefined);

  const files = collectFiles(obj);
  if (files.length > 0) payload.files = files;

  return payload;
}

function collectFiles(obj: Record<string, unknown>): string[] {
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'string' && v.length > 0) out.push(v);
  };
  const pushAll = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(push);
  };

  const toolInput = record(obj.tool_input) ?? record(obj.toolInput);
  push(toolInput?.file_path);
  push(toolInput?.filePath);
  pushAll(toolInput?.files);
  push(obj.file);
  push(obj.path);
  pushAll(obj.files);
  pushAll(obj.paths);

  return [...new Set(out)];
}

function record(v: unknown): Record<string, unknown> | undefined {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}
