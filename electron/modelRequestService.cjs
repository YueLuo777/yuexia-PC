const { normalizeModelRequestInput } = require('./ipcValidation.cjs');

function createModelRequestService({ modelSecretStore }) {
  const streamControllers = new Map();

  function authenticate(input, request) {
    const secretId = typeof input?.modelSecretId === 'string' ? input.modelSecretId.trim() : '';
    if (!secretId) return { ok: true, request };
    const secret = modelSecretStore.get(secretId);
    if (!secret.ok || !secret.apiKey) return { ok: false, message: secret.message || '模型 API Key 尚未保存。' };
    const headers = { ...request.headers };
    if (input?.provider === 'anthropic') {
      headers['x-api-key'] = secret.apiKey;
      delete headers.Authorization;
    } else {
      headers.Authorization = `Bearer ${secret.apiKey}`;
      delete headers['x-api-key'];
    }
    return { ok: true, request: { ...request, headers } };
  }

  function prepare(input) {
    const normalized = normalizeModelRequestInput(input);
    if (!normalized.ok) return { ok: false, response: { ok: false, status: 400, text: normalized.message } };
    const authenticated = authenticate(input, normalized);
    if (!authenticated.ok) return { ok: false, response: { ok: false, status: 400, text: authenticated.message } };
    return { ok: true, request: authenticated.request };
  }

  async function request(input) {
    const prepared = prepare(input);
    if (!prepared.ok) return prepared.response;
    const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 60000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(prepared.request.endpoint, {
        method: 'POST',
        headers: prepared.request.headers,
        body: prepared.request.body,
        signal: controller.signal,
      });
      return { ok: response.ok, status: response.status, text: await response.text() };
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      return {
        ok: false,
        status: timedOut ? 408 : 0,
        text: timedOut
          ? `Model request timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : 'Model request failed.',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  function extractParts(payload) {
    const choices = Array.isArray(payload?.choices) ? payload.choices : [];
    const content = choices
      .map((choice) => choice?.delta?.content ?? choice?.message?.content ?? choice?.text ?? '')
      .join('');
    const reasoning = choices
      .map(
        (choice) =>
          choice?.delta?.reasoning_content ??
          choice?.delta?.reasoning ??
          choice?.delta?.reasoning_text ??
          choice?.delta?.thinking ??
          '',
      )
      .join('');
    if (content || reasoning) return { content, reasoning };
    if (payload?.type === 'content_block_delta' && typeof payload?.delta?.text === 'string')
      return { content: payload.delta.text, reasoning: '' };
    if (
      payload?.type === 'content_block_delta' &&
      (payload?.delta?.type === 'thinking_delta' || typeof payload?.delta?.thinking === 'string')
    )
      return { content: '', reasoning: payload.delta.thinking ?? '' };
    if (payload?.type === 'message_delta' && typeof payload?.delta?.text === 'string')
      return { content: payload.delta.text, reasoning: '' };
    if (typeof payload?.reasoning_content === 'string') return { content: '', reasoning: payload.reasoning_content };
    if (typeof payload?.reasoning === 'string') return { content: '', reasoning: payload.reasoning };
    if (typeof payload?.completion === 'string') return { content: payload.completion, reasoning: '' };
    if (typeof payload?.content === 'string') return { content: payload.content, reasoning: '' };
    return { content: '', reasoning: '' };
  }

  function consumeBuffer(buffer, sendChunk) {
    const lines = buffer.split(/\r?\n/);
    const rest = lines.pop() ?? '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parts = extractParts(JSON.parse(data));
        if (parts.reasoning) sendChunk(parts.reasoning, 'reasoning');
        if (parts.content) sendChunk(parts.content, 'content');
      } catch {
        /* Ignore malformed event fragments. */
      }
    }
    return rest;
  }

  async function stream(event, input) {
    const prepared = prepare(input);
    if (!prepared.ok) return prepared.response;
    const requestId =
      typeof input?.requestId === 'string' && input.requestId ? input.requestId : `model-stream-${Date.now()}`;
    const channel = `model:stream:${requestId}`;
    const timeoutMs = Number.isFinite(Number(input?.timeoutMs)) ? Math.max(1000, Number(input.timeoutMs)) : 180000;
    const controller = new AbortController();
    streamControllers.set(requestId, controller);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let fullText = '';
    const sendChunk = (text, chunkType = 'content') => {
      if (chunkType === 'content') fullText += text;
      event.sender.send(channel, { type: 'chunk', chunkType, text });
    };
    try {
      const response = await fetch(prepared.request.endpoint, {
        method: 'POST',
        headers: prepared.request.headers,
        body: prepared.request.body,
        signal: controller.signal,
      });
      if (!response.ok || !response.body)
        return { ok: response.ok, status: response.status, text: await response.text() };
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer = consumeBuffer(buffer + decoder.decode(value, { stream: true }), sendChunk);
      }
      consumeBuffer(`${buffer}${decoder.decode()}\n`, sendChunk);
      return { ok: true, status: response.status, text: fullText };
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      return {
        ok: false,
        status: timedOut ? 408 : 0,
        text: timedOut
          ? `Model request timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : 'Model stream request failed.',
      };
    } finally {
      clearTimeout(timeout);
      streamControllers.delete(requestId);
    }
  }

  function cancel(requestId) {
    const controller = streamControllers.get(requestId);
    if (!controller) return false;
    controller.abort();
    streamControllers.delete(requestId);
    return true;
  }

  return { request, stream, cancel };
}

function registerModelRequestIpcHandlers(register, dependencies) {
  const service = createModelRequestService(dependencies);
  register('model:request', (_event, input) => service.request(input));
  register('model:stream', (event, input) => service.stream(event, input));
  register('model:cancel-stream', (_event, requestId) => service.cancel(requestId));
}

module.exports = { createModelRequestService, registerModelRequestIpcHandlers };
