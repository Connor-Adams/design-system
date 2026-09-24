A drag-and-drop file intake surface — drop or click-to-browse. Defaults to the statement-import wording, but every piece of copy is a slot, so it works for receipts, exports or audio too.

```jsx
<ImportDropzone
  accept=".csv,.ofx,.qfx"
  maxSize={10 * 1e6}
  onFiles={(files) => parseStatements(files)}
  onError={(bad) => toast(bad[0].message)}
/>

<ImportDropzone multiple accept="image/*" label="Drop receipts, or browse" hint="PNG or JPG" replaceLabel="click to change" />

<ImportDropzone files={picked} onFiles={setPicked} />   {/* controlled — files={[]} clears */}
```

Props: `accept` (enforced on drop as well as browse), `multiple`, `maxSize` (omit for no limit), `onFile` (legacy singular, still supported) / `onFiles`, `onError`, `label`/`children`, `hint`, `replaceLabel`, `files` (controlled), `disabled`. The click/keyboard target is a real `UploadButton` filling the surface, and rejections are announced in a polite live region.
