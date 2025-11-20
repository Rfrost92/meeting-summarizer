"use client";

import { FormEvent, useState } from "react";

type SummaryResult = {
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"meeting" | "podcast" | "generic">("meeting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an audio or video file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const data = (await res.json()) as SummaryResult;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-5xl space-y-8">
          {/* Header */}
          <header className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              AI-powered audio summarizer
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              AI Audio & Meeting Summarizer
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
              Upload a meeting, podcast, or any other recording and get a clean, structured
              summary with key points, action items, and decisions in minutes.
            </p>
          </header>

          {/* Upload card */}
          <section className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 md:p-7 shadow-[0_22px_60px_rgba(15,23,42,0.65)] backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Audio or video file
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setFile(f);
                        }}
                        className="block w-full text-sm text-slate-200
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-medium
                      file:bg-indigo-500 file:text-slate-950
                      hover:file:bg-indigo-400
                      file:transition-colors"
                    />
                    <p className="text-xs text-slate-500">
                      Supported formats: mp3, m4a, wav, mp4, webm, and more. Max size: 25 MB.
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-52">
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Audio type
                  </label>
                  <select
                      value={mode}
                      onChange={(e) =>
                          setMode(e.target.value as "meeting" | "podcast" | "generic")
                      }
                      className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="podcast">Podcast</option>
                    <option value="generic">Generic recording</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Used to slightly adjust how the summary is generated.
                  </p>
                </div>
              </div>

              {error && (
                  <div className="text-sm text-red-300 bg-red-950/40 border border-red-500/40 rounded-2xl px-3 py-2.5">
                    {error}
                  </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={loading || !file}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl
                  bg-indigo-500 text-slate-950 font-semibold text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-indigo-400 transition-colors"
                >
                  {loading ? "Processing audio…" : "Generate summary"}
                </button>
                <p className="text-xs text-slate-500">
                  Your file is processed securely and not stored after summarization.
                </p>
              </div>
            </form>
          </section>

          {/* Loading state */}
          {loading && (
              <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                Processing audio… running transcription and summarization.
              </section>
          )}

          {/* Results */}
          {result && (
              <>
                <section className="grid gap-4 md:grid-cols-2">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-slate-50">
                      Summary
                    </h2>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {result.summary}
                    </p>

                    <h3 className="text-sm font-semibold mt-3 text-slate-100">
                      Key points
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-200 space-y-1.5">
                      {result.keyPoints.map((p, i) => (
                          <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-slate-50">
                      Action items
                    </h2>
                    {result.actionItems.length ? (
                        <ul className="list-disc list-inside text-sm text-slate-200 space-y-1.5">
                          {result.actionItems.map((p, i) => (
                              <li key={i}>{p}</li>
                          ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400">
                          No explicit action items were detected.
                        </p>
                    )}

                    <h3 className="text-sm font-semibold mt-4 text-slate-100">
                      Decisions
                    </h3>
                    {result.decisions.length ? (
                        <ul className="list-disc list-inside text-sm text-slate-200 space-y-1.5">
                          {result.decisions.map((p, i) => (
                              <li key={i}>{p}</li>
                          ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400">
                          No explicit decisions were identified.
                        </p>
                    )}
                  </div>
                </section>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                  <details>
                    <summary className="cursor-pointer text-sm text-slate-400">
                      Show full transcript
                    </summary>
                    <pre className="mt-2 text-xs text-slate-200 whitespace-pre-wrap max-h-64 overflow-auto">
                  {result.transcript}
                </pre>
                  </details>
                </section>
              </>
          )}
        </div>
      </main>
  );
}
