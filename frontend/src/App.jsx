import React from "react";
import Panel from "./components/Panel.jsx";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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

export default function App() {
  const features = [
    "Multi PDF upload for quick knowledge intake",
    "Hybrid retrieval engine that blends keyword and semantic search",
    "Session based querying for focused research flows",
    "Source aware answers with citations and relevance scores",
    "Real time document ingestion to keep work moving",
    "Adjustable retrieval weights for better control",
    "Dashboard analytics to track usage and results",
    "REST API support for easy integration",
    "Clean research focused UI built for reading"
  ];

  const architecture = [
    "React frontend for upload, chat interface, dashboard, and session management",
    "FastAPI backend for document processing, hybrid search, and LLM calls",
    "ChromaDB for vector similarity search",
    "SQLite for metadata and session management",
    "rank bm25 for keyword retrieval",
    "Sentence Transformers for embeddings",
    "Google Gemini API for answer generation"
  ];

  return (
    <div className="relative min-h-screen bg-black text-white">
      <GridBackground />
      <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-[0.4em] text-[#8ab4ff]">
            About QueryAtlas
          </p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
            Research moves faster when answers are easy to find
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/60">
            QueryAtlas started as a capstone project pain point and grew into a
            focused tool for exploring research papers with speed and clarity.
          </p>
        </header>

        <div className="grid gap-8">
          <Panel title="Hero and Introduction">
            <p className="text-sm text-white/70">
              While working on a capstone project, my team had to read many
              research papers. Extracting specific insights such as which model
              a paper used or which dataset it relied on meant scanning entire
              sections by hand. That time loss inspired the idea for QueryAtlas.
            </p>
          </Panel>

          <Panel title="What QueryAtlas Does">
            <p className="text-sm text-white/70">
              QueryAtlas is a multi document RAG system with hybrid retrieval.
              Users upload research papers or PDFs and ask questions in natural
              language to find precise information fast.
            </p>
          </Panel>

          <Panel title="How It Works">
            <div className="space-y-3 text-sm text-white/70">
              <p>PDFs are uploaded and parsed using PyMuPDF.</p>
              <p>Text is split into semantic chunks.</p>
              <p>The system builds two indexes.</p>
              <p>BM25 handles keyword search.</p>
              <p>Sentence Transformer embeddings power semantic search.</p>
              <p>Results are combined using configurable weighting.</p>
              <p>The most relevant chunks are sent to the Google Gemini API.</p>
              <p>
                The final response includes source attribution with document
                name, page number, and relevance score.
              </p>
            </div>
          </Panel>

          <Panel title="Why Hybrid Retrieval Matters">
            <p className="text-sm text-white/70">
              BM25 works well for exact keyword matches. Semantic embeddings
              understand meaning and context. Combining both improves accuracy
              and helps retrieve the most relevant information.
            </p>
          </Panel>

          <Panel title="Key Features">
            <div className="grid gap-3 md:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Technical Architecture">
            <div className="grid gap-3 md:grid-cols-2">
              {architecture.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Closing">
            <p className="text-sm text-white/70">
              QueryAtlas started as a personal pain point while reading research
              papers and evolved into a tool that changes how people interact
              with large collections of documents.
            </p>
          </Panel>
        </div>
      </main>
    </div>
  );
}
