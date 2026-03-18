const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function getSessionToken() {
  return localStorage.getItem("rag_session") || "";
}

function authHeaders() {
  const token = getSessionToken();
  return token ? { "X-API-SESSION": token } : {};
}

export async function login(apiKey) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ api_key: apiKey })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      ...authHeaders()
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Logout failed");
  }
  return res.json();
}

export async function ingestFiles(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await fetch(`${API_BASE}/api/ingest`, {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }
  return res.json();
}

export async function askQuestion(question, topK, alpha) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({
      question,
      top_k: topK,
      alpha
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Query failed");
  }
  return res.json();
}

export async function askQuestionStream(question, topK, alpha, onToken, onDone) {
  const res = await fetch(`${API_BASE}/api/query-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({
      question,
      top_k: topK,
      alpha
    })
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(text || "Stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const markerIndex = buffer.indexOf("\n[[SOURCES]]");
    if (markerIndex !== -1) {
      const answerPart = buffer.slice(0, markerIndex);
      if (answerPart) onToken(answerPart);
      const jsonPart = buffer.slice(markerIndex + "\n[[SOURCES]]".length);
      if (jsonPart) {
        try {
          onDone(JSON.parse(jsonPart));
        } catch (err) {
          onDone([]);
        }
      } else {
        onDone([]);
      }
      return;
    }

    if (buffer) {
      onToken(buffer);
      buffer = "";
    }
  }
}
