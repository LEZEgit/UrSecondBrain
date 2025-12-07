// pages/index.js
import { useState } from "react";

export default function Home() {
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [maxSents, setMaxSents] = useState(5);

    async function handleSummarize() {
        if (!text.trim()) { setSummary("Paste some text first."); return; }
        setLoading(true); setSummary("");
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, max_sentences: Number(maxSents) }),
            });
            if (!res.ok) {
                const err = await res.text();
                setSummary("Server error: " + err);
            } else {
                const data = await res.json();
                setSummary(data.summary || "No summary returned.");
            }
        } catch (e) {
            setSummary("Network error: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-3xl mx-auto py-12 px-6">
            <h1 className="text-2xl font-semibold mb-2">Tiny Summarizer</h1>
            <p className="text-sm text-gray-500 mb-6">Paste text, choose length, click Summarise.</p>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste long text here..."
                className="w-full h-56 p-4 border rounded-md focus:ring"
            />

            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="bg-sky-600 text-white px-4 py-2 rounded disabled:opacity-60"
                >
                    {loading ? "Summarising…" : "Summarise"}
                </button>

                <label className="ml-auto text-sm text-gray-600 flex items-center gap-2">
                    Max sentences:
                    <select
                        value={maxSents}
                        onChange={(e) => setMaxSents(Number(e.target.value))}
                        className="border rounded px-2 py-1"
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={7}>7</option>
                    </select>
                </label>
            </div>

            <h2 className="mt-8 text-lg font-medium">Summary</h2>
            <div className="mt-2 p-4 bg-gray-50 rounded min-h-[6rem] whitespace-pre-wrap">
                {summary || "No summary yet."}
            </div>
        </main>
    );
}
