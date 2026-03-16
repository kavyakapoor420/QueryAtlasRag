import React, { useEffect, useMemo, useRef, useState } from "react";
import { ingestFiles, askQuestionStream, login, logout } from "./api.js";
import Panel from "./components/Panel.jsx";
import PrimaryButton from "./components/PrimaryButton.jsx";
import SqaureGridText from "./components/SqaureGrirdText.jsx";
import NavBar from "./components/NavBar.jsx";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const SESSION_KEY = "rag_session";

function GridBackground() {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
      )}
    />
  );
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "what",
  "when",
  "where",
  "which",
  "your",
  "have",
  "has",
  "been",
  "will",
  "would",
  "about",
  "into",
  "than",
  "then",
  "are",
  "you",
  "can",
  "how",
  "why",
  "who",
  "was",
  "were",
  "their",
  "they",
  "them",
  "its",
  "our",
  "not",
  "but",
  "all",
  "any",
  "use",
  "using"
]);

export default function App() {
  const [files, setFiles] = useState([]);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [alpha, setAlpha] = useState(0.5);
  const [rawAnswer, setRawAnswer] = useState("");
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const pendingRef = useRef("");
  const queueRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) setIsAuthed(true);
  }, []);

  useEffect(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        setDisplayAnswer((prev) => prev + next);
      } else if (!isStreaming) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 40);

    return () => {
      if (timerRef.current && !isStreaming) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isStreaming]);

  const onFilesChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!apiKey.trim()) {
      setAuthError("API key is required.");
      return;
    }
    try {
      setAuthLoading(true);
      const res = await login(apiKey.trim());
      localStorage.setItem(SESSION_KEY, res.session_token);
      setIsAuthed(true);
      setApiKey("");
    } catch (err) {
      setAuthError(err.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthError("");
    try {
      await logout();
    } catch (err) {
      setAuthError(err.message || "Logout failed.");
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setIsAuthed(false);
    }
  };

  const pushWords = (text) => {
    if (!text) return;
    pendingRef.current += text.replace(/\n/g, " ");
    const pending = pendingRef.current;
    const parts = pending.split(/\s+/);
    const endsWithSpace = /\s$/.test(pending);
    const complete = endsWithSpace ? parts : parts.slice(0, -1);
    pendingRef.current = endsWithSpace ? "" : parts[parts.length - 1] || "";
    queueRef.current.push(...complete.filter(Boolean).map((w) => `${w} `));
  };

  const handleIngest = async () => {
    setError("");
    setIngestResult(null);
    if (!files.length) {
      setError("Please select at least one PDF.");
      return;
    }
    try {
      setIngesting(true);
      const res = await ingestFiles(files);
      setIngestResult(res);
    } catch (err) {
      setError(err.message);
      if (String(err.message).toLowerCase().includes("session")) {
        localStorage.removeItem(SESSION_KEY);
        setIsAuthed(false);
      }
    } finally {
      setIngesting(false);
    }
  };

  const handleAsk = async () => {
    setError("");
    setRawAnswer("");
    setDisplayAnswer("");
    setSources([]);
    queueRef.current = [];
    pendingRef.current = "";
    if (!question.trim()) {
      setError("Ask a question first.");
      return;
    }
    try {
      setIsStreaming(true);
      await askQuestionStream(
        question.trim(),
        Number(topK),
        Number(alpha),
        (token) => {
          setRawAnswer((prev) => prev + token);
          pushWords(token);
        },
        (finalSources) => {
          pushWords(" ");
          setSources(finalSources || []);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setIsStreaming(false);
      if (String(err.message).toLowerCase().includes("session")) {
        localStorage.removeItem(SESSION_KEY);
        setIsAuthed(false);
      }
    }
  };

  const cleanedAnswer = displayAnswer
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[—–]/g, "-")
    .replace(/[*]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const keywords = useMemo(() => {
    const words = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    return new Set(words);
  }, [question]);

  const renderHighlighted = (text) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.trim() === "") return part;
      const normalized = part.replace(/[^a-z0-9]/gi, "").toLowerCase();
      if (keywords.has(normalized)) {
        return (
          <span key={idx} className="text-red-300">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const useList =
    cleanedAnswer.length > 260 &&
    cleanedAnswer.split(/[.!?]\s/).length > 1;

  const sentences = useList
    ? cleanedAnswer.split(/(?<=[.!?])\s+/)
    : [];

  return (
    <div className="relative min-h-screen bg-black text-white">
      <GridBackground />
      
      <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
       <NavBar/> 
        <header className="mb-10">
          {/* <p className="text-xs uppercase tracking-[0.4em] text-[#8ab4ff]">
            Hybrid Retrieval Platform
          </p> */}
          <SqaureGridText/>
          <h1 className=" mt-2 text-3xl md:text-3xl font-bold tracking-tight text-white leading-tight">
               Upload documents,combine keyword and semantic search {" "}  
               <span className=" underline decoration-red-700 underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"> (hybrid retrieval)</span>
                {" "} and get accurate AI answers backed by citations.
            </h1>
          <p className="mt-4 max-w-2xl text-base text-white/60">
            Upload PDFs, blend keyword and semantic search, and get grounded
            answers with transparent sources.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-white/10 bg-[#141414] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <span className="text-sm text-white/60">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
              disabled={isAuthed}
            />
            {isAuthed ? (
              <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleLogin} disabled={authLoading}>
                {authLoading ? "Checking..." : "Save Key"}
              </PrimaryButton>
            )}
          </div>
          {authError && (
            <div className="mt-3 text-sm text-red-300">{authError}</div>
          )}
          {isAuthed && (
            <div className="mt-2 text-xs text-white/50">
              API key verified. Upload and query are enabled.
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Panel
            index="01"
            title="Ingest Documents"
            subtitle="PDF ingestion enabled. PPTX, XLSX, DOCX coming soon."
          >
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-5">
              <p className="text-xs text-white/60">Select PDF files</p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={onFilesChange}
                className="mt-3 w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-[#3b82f6] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#2563eb]"
                disabled={!isAuthed}
              />
              <PrimaryButton
                onClick={handleIngest}
                disabled={ingesting || !isAuthed}
                className="mt-5 inline-flex items-center justify-center"
              >
                {ingesting ? "Ingesting..." : "Upload and Index"}
              </PrimaryButton>
              {ingestResult && (
                <div className="mt-4 text-sm text-white/60">
                  {ingestResult.ingested?.length || 0} file(s) indexed.
                </div>
              )}
            </div>
          </Panel>

          <Panel index="02" title="Configure Retrieval">
            <div className="space-y-5">
              <label className="block text-sm text-white/70">
                Top K Results
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                className="w-24 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                disabled={!isAuthed}
              />

              <label className="block text-sm text-white/70">
                Hybrid Weight (BM25 - Semantic)
              </label>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span>BM25</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={alpha}
                  onChange={(e) => setAlpha(e.target.value)}
                  className="w-full accent-[#3b82f6]"
                  disabled={!isAuthed}
                />
                <span>Semantic</span>
                <span className="ml-2 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-xs text-white/80">
                  {Number(alpha).toFixed(2)}
                </span>
              </div>
            </div>
          </Panel>
        </div>

        <Panel index="03" title="Ask Questions" className="mt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40"
              disabled={!isAuthed}
            />
            <PrimaryButton onClick={handleAsk} disabled={isStreaming || !isAuthed}>
              {isStreaming ? "Streaming..." : "Ask Query"}
            </PrimaryButton>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/50 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {cleanedAnswer && (
            <div className="mt-6 rounded-2xl bg-black/40 p-6">
              <h3 className="text-lg font-semibold">Answer</h3>
              {useList ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-white/80">
                  {sentences.map((line, idx) => (
                    <li key={idx}>{renderHighlighted(line)}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-white/80 whitespace-pre-wrap">
                  {renderHighlighted(cleanedAnswer)}
                </p>
              )}
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Sources</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {sources.map((src, idx) => (
                  <div
                    key={`${src.document_name}-${idx}`}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <div className="text-sm font-semibold">
                      {src.document_name} - p{src.page}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Relevance {src.score}
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      {src.preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </main>
    </div>
  );
}
