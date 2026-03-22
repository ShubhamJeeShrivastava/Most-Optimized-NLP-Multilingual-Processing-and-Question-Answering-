import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const uploadDocument = async (file, lang) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);
    const res = await axios.post(`${API_BASE}/upload/document/`, formData);
    return res.data;
};

export const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/upload/audio/`, formData);
    return res.data;
};

export const generateQA = async (context, prompt, useT5, lang) => {
    const res = await axios.post(`${API_BASE}/qa/generate/`, {
        context, prompt, use_t5: useT5, lang
    });
    return res.data;
};

export const answerFollowUp = async (question, originalAnswer, followup, context, lang) => {
    const res = await axios.post(`${API_BASE}/qa/answer/`, {
        question, original_answer: originalAnswer, followup, context, lang
    });
    return res.data;
};

export const evaluatePipeline = async (reference, generated) => {
    const res = await axios.post(`${API_BASE}/evaluate/`, { reference, generated });
    return res.data;
};
