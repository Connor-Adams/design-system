---
'@connor-adams/designsystem': minor
---

Add `forms/UploadButton`, and make `finance/ImportDropzone` reusable beyond bank statements.

`ImportDropzone` was the only file input in the package, so every app that needed
a plain "pick a file" button rebuilt the hidden-`<input type="file">`-plus-proxy-button
pattern by hand — the Rainbot dashboard alone carries two independent copies of it.
`UploadButton` is that pattern, done once: it composes `core/Button` (so `variant`
and `size` forward through and every interactive state still comes from
`Button.css`), resets the input's `value` after each selection so re-picking the
*same* file fires again, and sets `aria-busy` while `loading`.

`ImportDropzone` had four real limitations behind its statement-only framing: the
primary copy and the replace affordance were hard-coded and unslotted, it was
single-file only, it had no error channel at all (`onError` was explicitly
`Omit`ted), and its advertised 10MB limit was advisory — nothing enforced it,
and `accept` was never re-checked on drop, so a dragged `.pdf` was handed
straight to `onFile`. It now takes `label`/`children`, `replaceLabel`, `multiple`
+ `onFiles`, `maxSize`, `onError`, `disabled`, and a controlled `files` prop
(`files={[]}` or `files={null}` clears the selection from outside).

Both components share one set of intake rules — the new pure `forms/fileSelect`
module (`selectFiles`, `matchesAccept`, `formatFileSize`, all exported) — so a
drop is validated by exactly the code path a browse uses, rather than the input
handling existing twice inside the package. `ImportDropzone` composes
`UploadButton` for its click/keyboard affordance.

Every existing prop keeps its name, its default and its behaviour, so no call
site needs changing. Two things do change for existing users:

- A dropped file that does not satisfy `accept` is now rejected (reported via
  `onError` and announced in a live region) instead of being passed to `onFile`.
  `maxSize` stays opt-in — it is undefined by default, so nothing that used to
  reach `onFile` on size grounds stops doing so.
- The DOM is now a plain wrapper containing a real `<button>` that fills the
  surface, rather than `role="button"` + `tabIndex={0}` on the wrapper itself.
  That removes the nested-interactive/keyboard gap and gives the control a real
  accessible name, but the wrapper's padding moved onto the inner trigger — a
  consumer overriding `.ca-import-dropzone` padding should target
  `.ca-import-dropzone-trigger` instead.
