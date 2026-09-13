// A small whitespace formatter, not a full HTML pretty-printer.
export function formatText(source) {
  return source.replace(/\r\n?/g, '\n').split('\n')
    .map(line => line.replace(/[\t ]+$/g, '')).join('\n').trimEnd() + '\n';
}
