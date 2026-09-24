A file picker that looks like a Button — use it anywhere the app needs "pick a file" without hand-rolling a hidden `<input type="file">` and a proxy button.

```jsx
<UploadButton accept="audio/*" multiple loading={isUploading} loadingLabel="Uploading…" onFiles={(files) => upload(files)} onError={(bad) => toast(bad[0].message)}>
  Upload sounds
</UploadButton>
```

Variants: every `Button` `variant`/`size` forwards through. Props: `accept`, `multiple`, `maxSize` (real enforcement — rejects go to `onError`, never to `onFiles`), `loading` (disables + `aria-busy`), `icon`, `loadingLabel`, `inputRef`. Re-picking the same file fires `onFiles` again — the input's `value` is reset after every selection. For a drag-and-drop surface use `ImportDropzone`, which composes this for its browse affordance.
