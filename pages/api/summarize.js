// pages/api/summarize.js
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
console.log("API KEY LOADED:", !!OPENAI_KEY);

function localSummarize(text, maxSentences = 5) {
    const sents = text.replace(/\n+/g, " ").match(/[^.!?]+[.!?]?/g) || [text];
    const sentences = sents.map(s => s.trim()).filter(Boolean);
    if (sentences.length <= maxSentences) return sentences.join(" ");

    const freq = {};
    const tokenize = s => (s.toLowerCase().match(/\b[a-z0-9']{3,}\b/g) || []);
    sentences.forEach(s => {
        const toks = tokenize(s);
        toks.forEach(t => (freq[t] = (freq[t] || 0) + 1));
    });

    const scored = sentences.map((s, idx) => {
        const toks = tokenize(s);
        const score = toks.reduce((a, t) => a + (freq[t] || 0), 0) / Math.sqrt(Math.max(1, toks.length));
        return { idx, s, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, maxSentences).sort((a,b)=>a.idx-b.idx).map(x=>x.s);
    return top.join(" ");
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");
    try {
        const { text = "", max_sentences = 5 } = req.body;
        if (!text || typeof text !== "string") return res.status(400).send("Missing text");

        if (OPENAI_KEY) {
            // Simple Chat Completions call using fetch (vanilla)
            const prompt = `You are a concise summarizer. Produce a clear summary in ${max_sentences} sentences or fewer.\n\nText:\n${text}\n\nSummary:`;
            const payload = {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 400,
                temperature: 0.3
            };

            const r = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_KEY}`,
                },
                body: JSON.stringify(payload),
            });

            if (!r.ok) {
                const errText = await r.text();
                console.error("OpenAI error:", errText);
                return res.status(502).send("OpenAI API error");
            }

            const j = await r.json();
            const summary = j.choices?.[0]?.message?.content?.trim() || localSummarize(text, max_sentences);
            return res.status(200).json({ summary });
        } else {
            const summary = localSummarize(text, max_sentences);
            return res.status(200).json({ summary });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}
