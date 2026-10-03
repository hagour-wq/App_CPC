import { parseWorkbook } from '../lib/parse';
import type { ParseRequest, ParseResponse } from '../types/finance';
self.onmessage = (event: MessageEvent<ParseRequest>) => {
  let response: ParseResponse;
  try {
    response = { id: event.data.id, model: parseWorkbook(event.data.buffer) };
  } catch (e) {
    response = {
      id: event.data.id,
      error: e instanceof Error ? e.message : 'Classeur illisible',
    };
  }
  self.postMessage(response);
};
