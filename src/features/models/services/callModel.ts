import type { ModelItem } from '@/features/models/model/modelTypes';
import { addRecord } from '@/hooks/useCallRecords';

interface CallModelInput {
  model: ModelItem;
  prompt: string;
  userContent: string;
  chapterContext?: string;
  recordType?: 'api_test' | 'chat' | 'generate' | 'stream';
  signal?: AbortSignal;
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  return `${trimmed}/chat/completions`;
}

function normalizeAnthropicBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/v1/messages')) return trimmed;
  return `${trimmed}/v1/messages`;
}

const PINAI_ORIGIN = 'https://us.pinai-cn.com';

function formatModelError(status: number, text: string, model: ModelItem) {
  const normalizedText = text.slice(0, 500);
  if (status === 401 || /INVALID_API_KEY|invalid api key/i.test(normalizedText)) {
    return `当前模型「${model.name}」的 API Key 无效。请到“模型管理”重新填写 API Key，然后先点“API 测试”。服务端返回：${normalizedText}`;
  }
  const statusText = status > 0 ? String(status) : 'network';
  return `Model request failed (${statusText}): ${normalizedText}`;
}

function resolveBrowserEndpoint(endpoint: string) {
  if (endpoint.startsWith(PINAI_ORIGIN)) {
    return endpoint.replace(PINAI_ORIGIN, '/pinai-proxy');
  }
  return endpoint;
}

function createAbortError() {
  return new DOMException('Request aborted', 'AbortError');
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw createAbortError();
}

function normalizeTemperature(value: number | undefined) {
  const next = Number(value);
  if (!Number.isFinite(next)) return 0.7;
  const stepped = Math.round(next / 0.05) * 0.05;
  return Math.max(0.1, Math.min(1, Number(stepped.toFixed(2))));
}

async function postModelRequest(endpoint: string, headers: Record<string, string>, body: string, signal?: AbortSignal) {
  throwIfAborted(signal);
  if (window.xinyuexiaModel) {
    const request = window.xinyuexiaModel.request({ endpoint, headers, body });
    if (!signal) return request;
    return Promise.race([
      request,
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(createAbortError()), { once: true });
      }),
    ]);
  }

  try {
    const response = await fetch(resolveBrowserEndpoint(endpoint), {
      method: 'POST',
      headers,
      body,
      signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return {
      ok: false,
      status: 0,
      text: error instanceof Error ? error.message : 'Model request failed.',
    };
  }
}

export async function callModel({
  model,
  prompt,
  userContent,
  chapterContext,
  recordType = 'generate',
  signal,
}: CallModelInput) {
  if (!model.baseUrl.trim()) throw new Error('Model is missing Base URL');
  if (!model.apiKey.trim()) throw new Error('Model is missing API Key');
  throwIfAborted(signal);

  const provider = model.provider ?? 'openai-compatible';
  const endpoint = provider === 'anthropic' ? normalizeAnthropicBaseUrl(model.baseUrl) : normalizeBaseUrl(model.baseUrl);
  const startedAt = performance.now();
  const temperature = normalizeTemperature(model.temperature);
  const modelApiId = model.model || model.id;

  const systemPrompt = prompt || 'You are a writing assistant. Answer clearly and concretely.';
  const userMessage = chapterContext
    ? `Current chapter:\n${chapterContext}\n\nRequest:\n${userContent}`
    : userContent;

  const response = provider === 'anthropic'
    ? await postModelRequest(
        endpoint,
        {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01',
        },
        JSON.stringify({
          model: model.model || model.id,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
          max_tokens: 4096,
          temperature,
        }),
        signal,
      )
    : await postModelRequest(
        endpoint,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${model.apiKey}`,
        },
        JSON.stringify({
          model: model.model || model.id,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature,
          stream: false,
        }),
        signal,
      );

  throwIfAborted(signal);

  if (!response.ok) {
    addRecord({
      modelId: model.id,
      modelApiId,
      modelInstanceId: model.instanceId ?? model.id,
      modelName: model.name,
      type: recordType,
      status: 'failed',
      latencyMs: Math.round(performance.now() - startedAt),
      endpoint,
      error: response.text.slice(0, 500),
    });
    throw new Error(formatModelError(response.status, response.text, model));
  }

  const data = JSON.parse(response.text);
  const content = provider === 'anthropic'
    ? data?.content?.map((item: { type?: string; text?: string }) => (item.type === 'text' ? item.text ?? '' : '')).join('')
    : data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Model returned empty content');

  const usage = data?.usage ?? {};
  addRecord({
    modelId: model.id,
    modelApiId,
    modelInstanceId: model.instanceId ?? model.id,
    modelName: model.name,
    type: recordType,
    status: 'success',
    latencyMs: Math.round(performance.now() - startedAt),
    endpoint,
    inputTokens: usage.prompt_tokens ?? usage.input_tokens,
    outputTokens: usage.completion_tokens ?? usage.output_tokens,
    totalTokens: usage.total_tokens ?? (
      typeof usage.input_tokens === 'number' && typeof usage.output_tokens === 'number'
        ? usage.input_tokens + usage.output_tokens
        : undefined
    ),
  });

  return String(content);
}
