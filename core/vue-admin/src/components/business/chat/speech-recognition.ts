/**
 * Web Speech API（SpeechRecognition）类型与能力探测。
 * 该 API 属非标准浏览器能力，TypeScript DOM lib 未内置，且各内核前缀不一
 * （标准 SpeechRecognition / WebKit webkitSpeechRecognition），此处收敛为
 * 单一模块，组件只依赖本模块，不直接触碰 window 上的非标准字段。
 */

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

type SpeechRecognitionHost = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/** 返回当前内核可用的语音识别构造器，均不可用时返回 undefined */
export function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | undefined {
  const host = window as SpeechRecognitionHost;
  return host.SpeechRecognition ?? host.webkitSpeechRecognition;
}
