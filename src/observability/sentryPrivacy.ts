import type {
  ErrorEvent,
  Exception,
  StackFrame,
  Stacktrace,
  StreamedSpanJSON,
} from '@sentry/core';

function scrubStackFrame(frame: StackFrame): StackFrame {
  const safeFrame: StackFrame = {};

  if (frame.filename) safeFrame.filename = frame.filename;
  if (frame.function) safeFrame.function = frame.function;
  if (frame.module) safeFrame.module = frame.module;
  if (frame.platform) safeFrame.platform = frame.platform;
  if (frame.lineno !== undefined) safeFrame.lineno = frame.lineno;
  if (frame.colno !== undefined) safeFrame.colno = frame.colno;
  if (frame.abs_path) safeFrame.abs_path = frame.abs_path;
  if (frame.in_app !== undefined) safeFrame.in_app = frame.in_app;
  if (frame.debug_id) safeFrame.debug_id = frame.debug_id;

  return safeFrame;
}

function scrubStacktrace(stacktrace: Stacktrace): Stacktrace {
  return {
    ...(stacktrace.frames
      ? { frames: stacktrace.frames.map((frame) => scrubStackFrame(frame)) }
      : {}),
  };
}

function scrubException(exception: Exception): Exception {
  const safeException: Exception = {};

  if (exception.type) safeException.type = exception.type;
  if (exception.stacktrace) safeException.stacktrace = scrubStacktrace(exception.stacktrace);

  return safeException;
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed: Partial<ErrorEvent> = {};

  // This is a Sentry-generated technical identifier, not an account or child identifier.
  if (event.event_id) scrubbed.event_id = event.event_id;
  if (event.release) scrubbed.release = event.release;
  if (event.environment) scrubbed.environment = event.environment;
  if (event.platform) scrubbed.platform = event.platform;
  if (event.level) scrubbed.level = event.level;

  if (event.exception?.values) {
    scrubbed.exception = {
      values: event.exception.values.map((exception) => scrubException(exception)),
    };
  }

  return scrubbed as ErrorEvent;
}

export function scrubSentrySpan(span: StreamedSpanJSON): StreamedSpanJSON {
  return {
    trace_id: span.trace_id,
    ...(span.parent_span_id ? { parent_span_id: span.parent_span_id } : {}),
    span_id: span.span_id,
    name: 'milo-phonics',
    start_timestamp: span.start_timestamp,
    ...(span.end_timestamp !== undefined ? { end_timestamp: span.end_timestamp } : {}),
    status: span.status,
    is_segment: span.is_segment,
    attributes: {},
  };
}
