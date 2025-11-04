import React, { useMemo, useRef, useState } from "react";

type Mode = "json2toon" | "toon2json";

type ConvertResponse = {
  ok: boolean;
  filename?: string;
  content?: string;
  error?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [mode, setMode] = useState<Mode>("json2toon");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  // JSON → TOON options
  const [root, setRoot] = useState("");
  const [delimiter, setDelimiter] = useState<"comma" | "tab" | "pipe">("comma");
  const [indent, setIndent] = useState(2);
  const [lengthMarker, setLengthMarker] = useState(false);
  const [coerce, setCoerce] = useState(false);

  // TOON → JSON options
  const [pretty, setPretty] = useState(true);
  const [ensureAscii, setEnsureAscii] = useState(false);

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [outName, setOutName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const accept = useMemo(
    () => (mode === "json2toon" ? ".json,.txt,.ndjson" : ".toon,.txt"),
    [mode]
  );
  const targetExt = useMemo(() => (mode === "json2toon" ? ".toon" : ".json"), [mode]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleConvert() {
    setErr(null);
    setOutput("");
    setOutName("");

    if (!file && !text.trim()) {
      setErr("Please upload a file or paste some content first.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("mode", mode);

      if (file) form.append("file", file, file.name);
      else form.append("text", text);

      if (mode === "json2toon") {
        form.append("delimiter", delimiter);
        form.append("indent", String(indent));
        if (root.trim()) form.append("root", root.trim());
        if (lengthMarker) form.append("length_marker", "1");
        if (coerce) form.append("coerce", "1");
      } else {
        if (pretty) form.append("pretty", "1");
        if (ensureAscii) form.append("ensure_ascii", "1");
      }

      const res = await fetch(`${API_BASE}/api/convert`, { method: "POST", body: form });
      const data: ConvertResponse = await res.json();
      if (!data.ok) throw new Error(data.error || "Conversion failed");

      setOutput(data.content || "");
      setOutName(
        data.filename ||
          (file ? file.name.replace(/(\.[^.]+)?$/, targetExt) : `output${targetExt}`)
      );
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setText("");
    setOutput("");
    setOutName("");
    setErr(null);
    setRoot("");
    setDelimiter("comma");
    setIndent(2);
    setLengthMarker(false);
    setCoerce(false);
    setPretty(true);
    setEnsureAscii(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold">JSON ⇄ TOON Converter</h1>
          <a
            href="https://github.com/toon-format/toon"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            TOON spec ↗
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Mode */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded-lg text-sm border ${
                mode === "json2toon"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setMode("json2toon")}
            >
              JSON → TOON
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm border ${
                mode === "toon2json"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setMode("toon2json")}
            >
              TOON → JSON
            </button>
          </div>

          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload {mode === "json2toon" ? "JSON / NDJSON" : "TOON"}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white hover:file:bg-black/90"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button
                  className="mt-2 text-xs text-slate-600 underline"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Clear file
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Or paste {mode === "json2toon" ? "JSON" : "TOON"}
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  placeholder={mode === "json2toon" ? "Paste JSON here…" : "Paste TOON here…"}
                  className="w-full rounded-lg border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 rounded-xl border p-4 bg-slate-50">
              <div className="font-medium">Options</div>

              {mode === "json2toon" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Root (dotted path)</label>
                    <input
                      className="w-full rounded-md border px-2 py-1 text-sm"
                      value={root}
                      onChange={(e) => setRoot(e.target.value)}
                      placeholder="e.g. passengers or data.items.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Delimiter</label>
                    <select
                      className="w-full rounded-md border px-2 py-1 text-sm"
                      value={delimiter}
                      onChange={(e) =>
                        setDelimiter(e.target.value as "comma" | "tab" | "pipe")
                      }
                    >
                      <option value="comma">comma (,)</option>
                      <option value="tab">tab (\t)</option>
                      <option value="pipe">pipe (|)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Indent: {indent}</label>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={indent}
                      onChange={(e) => setIndent(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="lenmark"
                      type="checkbox"
                      checked={lengthMarker}
                      onChange={(e) => setLengthMarker(e.target.checked)}
                    />
                    <label htmlFor="lenmark" className="text-sm">
                      Length marker in table headers
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="coerce"
                      type="checkbox"
                      checked={coerce}
                      onChange={(e) => setCoerce(e.target.checked)}
                    />
                    <label htmlFor="coerce" className="text-sm">
                      Coerce values (\"123\" → 123, true/false/null)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="pretty"
                      type="checkbox"
                      checked={pretty}
                      onChange={(e) => setPretty(e.target.checked)}
                    />
                    <label htmlFor="pretty" className="text-sm">
                      Pretty JSON
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="ascii"
                      type="checkbox"
                      checked={ensureAscii}
                      onChange={(e) => setEnsureAscii(e.target.checked)}
                    />
                    <label htmlFor="ascii" className="text-sm">
                      Ensure ASCII (escape non-ASCII)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleConvert}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-slate-400" : "bg-slate-900 hover:bg-black"
              }`}
            >
              {loading ? "Converting…" : "Convert"}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-100"
            >
              Reset
            </button>
            {output && (
              <button
                onClick={() => download(outName || `output${targetExt}`, output)}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-100"
              >
                Download
              </button>
            )}
          </div>

          {/* Error */}
          {err && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Output Preview</label>
              <textarea
                readOnly
                value={output}
                rows={14}
                className="w-full rounded-lg border p-3 font-mono text-sm bg-white"
              />
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Backend: POST <code>/api/convert</code> (multipart). Configure <code>VITE_API_BASE</code> in <code>.env</code>.
        </p>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        Built with React + Vite + Tailwind
      </footer>
    </div>
  );
}
