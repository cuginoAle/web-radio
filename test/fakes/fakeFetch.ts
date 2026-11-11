export type FakeRequest = { url: string; headers: Record<string, string>; signal?: AbortSignal | null };
type Reply = Response | Error | ((request: FakeRequest) => Response | Promise<Response>);

/** A fetch boundary that answers from a queue of replies and records every request. */
export function createFakeFetch(replies: Reply[] = []) {
  const requests: FakeRequest[] = [];
  const queue = [...replies];
  const fetch = async (input: string, init: RequestInit = {}) => {
    const request = { url: input, headers: (init.headers ?? {}) as Record<string, string>, signal: init.signal };
    requests.push(request);
    const reply = queue.shift();
    if (!reply) throw new Error(`unexpected request ${input}`);
    if (reply instanceof Error) throw reply;
    return typeof reply === 'function' ? reply(request) : reply;
  };
  return { fetch, requests, reply: (r: Reply) => queue.push(r) };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Never answers until the request is aborted, like a hung connection. */
export const hang = (request: FakeRequest) =>
  new Promise<Response>((_, reject) =>
    request.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
  );
