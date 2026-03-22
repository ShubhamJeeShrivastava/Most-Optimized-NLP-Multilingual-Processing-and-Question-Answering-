import React, { useState } from 'react';
import { UploadCloud, MessageSquare, Activity, Settings, RefreshCw, Layers } from 'lucide-react';
import { uploadDocument, uploadAudio, generateQA, answerFollowUp, evaluatePipeline } from './api';

function App() {
    const [activeTab, setActiveTab] = useState('upload');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState('');
    const [summary, setSummary] = useState('');
    const [qaPairs, setQaPairs] = useState({});
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [prompt, setPrompt] = useState('Generate questions from this text');
    const [useT5, setUseT5] = useState(false);

    // Follow-up state
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [followUpQ, setFollowUpQ] = useState('');
    const [followUpA, setFollowUpA] = useState('');

    // Evaluation state
    const [evalMetrics, setEvalMetrics] = useState(null);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            let data;
            if (type === 'doc') {
                data = await uploadDocument(file, selectedLanguage);
            } else {
                data = await uploadAudio(file);
            }
            setContext(data.context);
            alert('Upload successful. Context loaded.');
        } catch (err) {
            console.error(err);
            alert('Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQA = async () => {
        if (!context) return alert('Please upload a document or audio first.');
        setLoading(true);
        try {
            const data = await generateQA(context, prompt, useT5, selectedLanguage);
            setQaPairs(data.qa_pairs || {});
            setSummary(data.summary || '');
            setActiveTab('qa');
        } catch (err) {
            console.error(err);
            alert('Error generating Q&A');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUp = async () => {
        if (!selectedQuestion) return alert('Select a base question first.');
        if (!followUpQ) return alert('Enter a follow-up question.');
        setLoading(true);
        try {
            const originalAnswer = qaPairs[selectedQuestion];
            const data = await answerFollowUp(selectedQuestion, originalAnswer, followUpQ, context, selectedLanguage);
            setFollowUpA(data.answer);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async () => {
        if (Object.keys(qaPairs).length === 0) return alert('Generate Q&A first.');
        setLoading(true);
        try {
            // For evaluation, we test how well an answer aligns with the context.
            // We'll just evaluate the first Q/A pair against the summary or context for demonstration.
            const firstQ = Object.keys(qaPairs)[0];
            const reference = context.substring(0, 1500); // chunk of context
            const generated = qaPairs[firstQ];
            const data = await evaluatePipeline(reference, generated);
            setEvalMetrics(data);
            setActiveTab('eval');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 glass-card m-4 flex flex-col items-center py-8">
                <div className="flex items-center gap-2 mb-12 text-primary font-bold text-2xl">
                    <Layers className="w-8 h-8" />
                    <span>NeuroQA</span>
                </div>

                <nav className="w-full px-4 space-y-2">
                    <button onClick={() => setActiveTab('upload')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-primary/20 text-primary' : 'text-textMuted hover:bg-white/5'}`}>
                        <UploadCloud size={20} /> Data Ingestion
                    </button>
                    <button onClick={() => setActiveTab('qa')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-primary/20 text-primary' : 'text-textMuted hover:bg-white/5'}`}>
                        <MessageSquare size={20} /> Q&A Workspace
                    </button>
                    <button onClick={() => setActiveTab('eval')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === 'eval' ? 'bg-primary/20 text-primary' : 'text-textMuted hover:bg-white/5'}`}>
                        <Activity size={20} /> Evaluation Metrics
                    </button>
                </nav>

                <div className="mt-auto w-full px-4">
                    <div className="p-4 bg-black/20 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><Settings size={16} /> Configuration</h3>
                        <select className="input-field text-sm p-2" value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}>
                            <option value="en">English (Default)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="hi">Hindi</option>
                            <option value="de">German</option>
                            <option value="zh-cn">Chinese</option>
                            <option value="ar">Arabic</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
                            <input type="checkbox" checked={useT5} onChange={e => setUseT5(e.target.checked)} className="accent-primary" />
                            Use Custom T5 Model
                        </label>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 pb-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-6">

                    {loading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="animate-fade-in space-y-6">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Data Ingestion Station
                            </h1>
                            <p className="text-textMuted">Upload multilingual PDFs or real-time audio for processing.</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="glass-card p-8 text-center border-dashed border-2 border-white/20 hover:border-primary transition-all">
                                    <UploadCloud className="w-16 h-16 mx-auto mb-4 text-primary opacity-80" />
                                    <h3 className="text-xl font-semibold mb-2">Upload Document</h3>
                                    <p className="text-sm text-textMuted mb-6">PDF files up to 50MB</p>
                                    <label className="btn-primary cursor-pointer">
                                        Browse Files
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e, 'doc')} />
                                    </label>
                                </div>

                                <div className="glass-card p-8 text-center border-dashed border-2 border-white/20 hover:border-secondary transition-all">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-secondary opacity-80" />
                                    <h3 className="text-xl font-semibold mb-2">Upload Audio</h3>
                                    <p className="text-sm text-textMuted mb-6">MP3/WAV files for transcription</p>
                                    <label className="btn-secondary text-primary cursor-pointer border-secondary">
                                        Browse Audio
                                        <input type="file" accept="audio/*" className="hidden" onChange={e => handleFileUpload(e, 'audio')} />
                                    </label>
                                </div>
                            </div>

                            {context && (
                                <div className="glass-card p-6 mt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-accent">Extracted Context Snippet</h3>
                                    <p className="text-sm text-textMuted bg-black/30 p-4 rounded-xl h-32 overflow-y-auto">
                                        {context.substring(0, 500)}...
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Enter a prompt to guide Q&A generation..."
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                        />
                                        <button onClick={handleGenerateQA} className="btn-primary w-full">Initialize QA Generation Pipeline</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'qa' && (
                        <div className="animate-fade-in space-y-6">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Interactive Q&A Workspace
                            </h1>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-6">
                                    {Object.keys(qaPairs).length === 0 ? (
                                        <div className="glass-card p-8 text-center text-textMuted">No questions generated yet.</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(qaPairs).map(([q, a], idx) => (
                                                <div key={idx} className="glass-card p-6 transition-all hover:bg-white/5 cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                                                    <div className="font-semibold text-lg text-primary mb-2">Q: {q}</div>
                                                    <div className="text-textMain/90">A: {a}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {summary && (
                                        <div className="glass-card p-6 border-accent/30">
                                            <h3 className="font-semibold text-accent mb-2">Document Summary</h3>
                                            <p className="text-sm text-textMuted leading-relaxed">{summary}</p>
                                        </div>
                                    )}

                                    <div className="glass-card p-6 sticky top-6">
                                        <h3 className="font-semibold mb-4 text-primary">Follow-up Analysis</h3>
                                        <p className="text-xs text-textMuted mb-4">Select a question from the left to ask a contextual follow-up.</p>
                                        {selectedQuestion ? (
                                            <div className="space-y-4">
                                                <div className="text-sm p-3 bg-black/30 rounded-lg border border-primary/20">
                                                    <span className="text-primary font-bold">Base:</span> {selectedQuestion}
                                                </div>
                                                <textarea
                                                    className="input-field min-h-[100px] text-sm"
                                                    placeholder="Your follow-up question..."
                                                    value={followUpQ}
                                                    onChange={e => setFollowUpQ(e.target.value)}
                                                />
                                                <button onClick={handleFollowUp} className="btn-primary w-full text-sm">Analyze Follow-up</button>

                                                {followUpA && (
                                                    <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl text-sm">
                                                        <span className="font-bold block mb-1">Follow-up Answer:</span>
                                                        {followUpA}
                                                    </div>
                                                )}

                                                <button onClick={handleEvaluate} className="btn-secondary w-full text-sm mt-4 border-accent text-accent">Run Evaluation Pipeline</button>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-textMuted italic">No question selected.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'eval' && (
                        <div className="animate-fade-in space-y-6">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
                                Automated Evaluation Metrics
                            </h1>
                            <p className="text-textMuted">Semantic embeddings and TF-IDF driven accuracy assessment.</p>

                            {!evalMetrics ? (
                                <div className="glass-card p-12 text-center">
                                    <Activity className="w-16 h-16 mx-auto mb-4 text-accent opacity-50" />
                                    <p className="mb-4 text-textMuted">Run the evaluation pipeline from the Q&A Workspace to see metrics here.</p>
                                    <button onClick={handleEvaluate} className="btn-primary">Execute Evaluation</button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="glass-card p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={100} /></div>
                                        <h3 className="text-xl font-semibold mb-6">Overall Contextual Alignment</h3>
                                        <div className="text-6xl font-black text-accent mb-2">
                                            {(evalMetrics.overall_accuracy * 100).toFixed(1)}%
                                        </div>
                                        <p className="text-textMuted">Accuracy in generated outputs against reference context.</p>
                                    </div>

                                    <div className="glass-card p-8 space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-semibold">Semantic Embedding Score</span>
                                                <span className="text-sm text-primary">{(evalMetrics.semantic_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-black/40 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${evalMetrics.semantic_score * 100}%` }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-semibold">TF-IDF Syntactic Match</span>
                                                <span className="text-sm text-secondary">{(evalMetrics.tfidf_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-black/40 rounded-full h-2">
                                                <div className="bg-secondary h-2 rounded-full" style={{ width: `${evalMetrics.tfidf_score * 100}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                            <span className="font-semibold">Syntactic Correctness:</span>
                                            {evalMetrics.syntactic_correctness ? (
                                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">VERIFIED</span>
                                            ) : (
                                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">FAILED</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default App;
