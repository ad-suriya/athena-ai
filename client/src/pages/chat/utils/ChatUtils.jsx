import React from 'react';
import CopyButton from '../../../components/CopyButton';

export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const fetchLinkPreview = async (url) => {
  try {
    const apiKey = 'a00c0acc8d71a95ca890ebf7c659d05f';
    const response = await fetch(
      `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch link preview');
    }
    return {
      title: data.title || 'No Title',
      description: data.description || 'No description available',
      image: data.image || '',
      url: data.url || url,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return { title: 'Error Loading Preview', description: 'Could not load preview', image: '', url };
  }
};

export const formatMessageContent = (content) => {
  if (!content) return content;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeContent = part.slice(3, -3).trim();
      const languageMatch = codeContent.match(/^(\w+)\n/);
      const language = languageMatch ? languageMatch[1] : '';
      const pureCode = language ? codeContent.slice(language.length).trim() : codeContent;

      return (
        <div key={`code-${index}`} className="code-block">
          <div className="code-header">
            <span className="code-language">{language || 'code'}</span>
            <CopyButton text={pureCode} />
          </div>
          <pre className="code-content">
            <code>{pureCode}</code>
          </pre>
        </div>
      );
    }

    const processedPart = part.split(/(\n)/g).map((line, lineIndex) => {
      if (line === '\n') return <br key={`br-${lineIndex}`} />;

      if (line.startsWith('### ') && line.length > 4) {
        const headingText = line.substring(4).trim().replace(/\*/g, '');
        return (
          <h3
            key={`h3-${lineIndex}`}
            className="text-lg font-bold mt-4 mb-2 text-gray-800"
          >
            {headingText}
          </h3>
        );
      }

      if (line.startsWith('## ') && line.length > 3) {
        const headingText = line.substring(3).trim();
        return (
          <h2
            key={`h2-${lineIndex}`}
            className="text-xl font-bold mt-5 mb-3 text-gray-900"
          >
            {headingText}
          </h2>
        );
      }

      if (line.startsWith('# ') && line.length > 2) {
        const headingText = line.substring(2).trim();
        return (
          <h1
            key={`h1-${lineIndex}`}
            className="text-2xl font-bold mt-6 mb-4 text-gray-900"
          >
            {headingText}
          </h1>
        );
      }

      const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={`text-${lineIndex}`}>
          {boldParts.map((boldPart, boldIndex) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
              const boldText = boldPart.slice(2, -2);
              return <strong key={`bold-${boldIndex}`}>{boldText}</strong>;
            }
            return boldPart;
          })}
        </span>
      );
    });

    return <span key={`part-${index}`}>{processedPart}</span>;
  });
};

export const callChatAPI = async (messageText, history, flags, modelParam) => {
  let endpoint = '/api/chat';
  let body = {
    message: messageText,
    history,
    model: modelParam,
  };

  if (flags.isSearch) {
    endpoint = '/api/search';
    body = {
      query: messageText.replace('[Search]', '').trim(),
      model: modelParam,
    };
  } else if (flags.isDeepResearch) {
    endpoint = '/api/research';
    body = {
      query: messageText.replace('[Deep Research]', '').trim(),
      model: modelParam,
    };
  } else if (flags.isCriticalAnalysis) {
    endpoint = '/api/analyze';
    body = {
      query: messageText.replace('[Critical Analysis]', '').trim(),
      model: modelParam,
    };
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (!data.response) {
    throw new Error('No response content received from API');
  }

  return data;
};

export const exportToPDF = (messageContent, authorName = 'Anonymous') => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setProperties({
      title: 'Chat Message',
      author: authorName,
      creator: 'Athena AI',
    });

    const lines = doc.splitTextToSize(messageContent, 180);
    doc.text(lines, 10, 10);

    doc.save('chat_message.pdf');
  };
  document.body.appendChild(script);
};
