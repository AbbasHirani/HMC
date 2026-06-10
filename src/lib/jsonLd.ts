// Safely serialize an object for embedding in a <script type="application/ld+json">
// tag via dangerouslySetInnerHTML. JSON.stringify does NOT escape `<`, `>` or `&`,
// so a DB-sourced string containing `</script>` could break out of the tag and
// execute. Escaping these to their \uXXXX forms keeps the JSON valid while making
// tag-breakout impossible.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
