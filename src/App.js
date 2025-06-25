import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Shield,
  Trash2,
  Info,
  MessageSquare,
  Send,
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:3001/api";

// Componente CommentForm spostato fuori da App per evitare re-render
const CommentForm = React.memo(
  ({ isSecure, newComment, setNewComment, handleSubmit, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Il tuo nome"
          value={newComment.username}
          onChange={(e) =>
            setNewComment({ ...newComment, username: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={(e) => handleSubmit(e, isSecure)}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
            isSecure
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50`}
        >
          <Send size={16} />
          {loading ? "Invio..." : "Invia"}
        </button>
      </div>
      <textarea
        placeholder="Prova: <img src=x onerror=alert('XSS!')> oppure <svg onload=alert('XSS!')></svg>"
        value={newComment.content}
        onChange={(e) =>
          setNewComment({ ...newComment, content: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows="3"
      />
    </div>
  )
);

function App() {
  const [vulnerableComments, setVulnerableComments] = useState([]);
  const [secureComments, setSecureComments] = useState([]);
  const [newComment, setNewComment] = useState({ username: "", content: "" });
  const [activeTab, setActiveTab] = useState("vulnerable");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carica commenti vulnerabili
  const loadVulnerableComments = async () => {
    try {
      const response = await fetch(`${API_BASE}/comments/vulnerable`);
      const data = await response.json();
      setVulnerableComments(data);
    } catch (error) {
      console.error("Errore nel caricamento commenti vulnerabili:", error);
    }
  };

  // Carica commenti sicuri
  const loadSecureComments = async () => {
    try {
      const response = await fetch(`${API_BASE}/comments/secure`);
      const data = await response.json();
      setSecureComments(data);
    } catch (error) {
      console.error("Errore nel caricamento commenti sicuri:", error);
    }
  };

  // Carica informazioni
  const loadInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/info`);
      const data = await response.json();
      setInfo(data);
    } catch (error) {
      console.error("Errore nel caricamento info:", error);
    }
  };

  useEffect(() => {
    loadVulnerableComments();
    loadSecureComments();
    loadInfo();
  }, []);

  const handleSubmit = React.useCallback(
    async (e, isSecure = false) => {
      e.preventDefault();
      if (!newComment.username.trim() || !newComment.content.trim()) return;

      setLoading(true);
      const endpoint = isSecure ? "secure" : "vulnerable";

      try {
        const response = await fetch(`${API_BASE}/comments/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        });

        if (response.ok) {
          setNewComment({ username: "", content: "" });
          // Ricarica i commenti
          if (isSecure) {
            loadSecureComments();
          } else {
            loadVulnerableComments();
          }
        }
      } catch (error) {
        console.error("Errore nell'invio del commento:", error);
      } finally {
        setLoading(false);
      }
    },
    [newComment]
  );

  const clearComments = async () => {
    try {
      await fetch(`${API_BASE}/comments/clear`, { method: "DELETE" });
      loadVulnerableComments();
      loadSecureComments();
    } catch (error) {
      console.error("Errore nella cancellazione:", error);
    }
  };

  const CommentList = React.memo(({ comments, isVulnerable = false }) => (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-gray-500" />
            <span className="font-medium text-gray-800">
              {console.log(isVulnerable)}
              {isVulnerable ? (
                <span dangerouslySetInnerHTML={{ __html: comment.username }} />
              ) : (
                comment.username
              )}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString("it-IT")}
            </span>
          </div>
          <div className="text-gray-700">
            {isVulnerable ? (
              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
            ) : (
              <div>{comment.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Demo XSS Stored - Vulnerabile vs Sicuro
          </h1>
          <p className="text-lg text-gray-600">
            Esempio educativo di attacco XSS stored e relative contromisure
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("vulnerable")}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === "vulnerable"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle size={20} />
            Versione Vulnerabile
          </button>
          <button
            onClick={() => setActiveTab("secure")}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === "secure"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Shield size={20} />
            Versione Sicura
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === "info"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Info size={20} />
            Informazioni
          </button>
          <button
            onClick={clearComments}
            className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
          >
            <Trash2 size={20} />
            Cancella Tutto
          </button>
        </div>

        {/* Content */}
        {activeTab === "vulnerable" && (
          <div>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h3 className="text-lg font-semibold text-red-800">
                  ⚠️ VERSIONE VULNERABILE
                </h3>
              </div>
              <p className="text-red-700">
                Questa versione NON filtra l'input dell'utente. React blocca
                &lt;script&gt; ma questi payload funzionano:
              </p>
              <div className="mt-2 space-y-1">
                <code className="block bg-red-100 px-2 py-1 rounded text-xs">
                  &lt;img src=x onerror=alert('XSS!')&gt;
                </code>
                <code className="block bg-red-100 px-2 py-1 rounded text-xs">
                  &lt;svg onload=alert('SVG_XSS!')&gt;&lt;/svg&gt;
                </code>
                <code className="block bg-red-100 px-2 py-1 rounded text-xs">
                  &lt;div onclick=alert('Click_XSS!')
                  style="cursor:pointer;color:red"&gt;Click me&lt;/div&gt;
                </code>
              </div>
            </div>

            <CommentForm
              isSecure={false}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmit={handleSubmit}
              loading={loading}
            />
            <CommentList comments={vulnerableComments} isVulnerable={true} />
          </div>
        )}

        {activeTab === "secure" && (
          <div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-green-800">
                  ✅ VERSIONE SICURA
                </h3>
              </div>
              <p className="text-green-700">
                Questa versione sanitizza tutto l'input dell'utente. I caratteri
                HTML vengono convertiti in entità sicure. Prova lo stesso script
                di prima: il codice verrà mostrato come testo normale.
              </p>
            </div>

            <CommentForm
              isSecure={true}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmit={handleSubmit}
              loading={loading}
            />
            <CommentList comments={secureComments} isVulnerable={false} />
          </div>
        )}

        {activeTab === "info" && info && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" />
                Versione Vulnerabile
              </h3>
              <p className="text-red-700 mb-4">
                {info.vulnerabile.descrizione}
              </p>
              <h4 className="font-semibold text-red-800 mb-2">Rischi:</h4>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {info.vulnerabile.rischi.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <Shield className="text-green-600" />
                Versione Sicura
              </h3>
              <p className="text-green-700 mb-4">{info.sicura.descrizione}</p>
              <h4 className="font-semibold text-green-800 mb-2">Protezioni:</h4>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                {info.sicura.protezioni.map((protection, index) => (
                  <li key={index}>{protection}</li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                Script di Test per XSS
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <code className="text-sm">
                    &lt;script&gt;alert('XSS Basic')&lt;/script&gt;
                  </code>
                </div>
                <div className="bg-white p-3 rounded border">
                  <code className="text-sm">
                    &lt;img src=x onerror=alert('XSS Image')&gt;
                  </code>
                </div>
                <div className="bg-white p-3 rounded border">
                  <code className="text-sm">
                    &lt;svg onload=alert('XSS SVG')&gt;
                  </code>
                </div>
                <div className="bg-white p-3 rounded border">
                  <code className="text-sm">
                    javascript:alert('XSS JavaScript')
                  </code>
                </div>
              </div>
              <p className="text-blue-700 mt-4">
                Prova questi script nella versione vulnerabile per vedere come
                vengono eseguiti, poi provale nella versione sicura per vedere
                come vengono neutralizzati.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

