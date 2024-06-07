"use client"
import React, { useState, useRef, useEffect } from 'react';
import { processPrompt } from './tp-ws-client.js';

export default function Assistant() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState('MISTRAL')
  const [domain, setDomain] = useState('PA')
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [foldStates, setFoldStates] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [conversations]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    const t1 = new Date()
    const newConversation = { query: input, model: model, domain: domain, start: t1, responses: [] }
    setConversations((prevConversations) => [...prevConversations, newConversation]);
    let stepNumber = 0

    try {
      await processPrompt({ domain, model, userPrompt: input, textHandler, imageHandler })
    }
    finally {
      setLoading(false)
      setInput('');
    }

    function imageHandler(data) {
      console.log('Image received:', data)
      stepNumber++

      const reader = new FileReader();
      reader.onload = function (e) {
        console.log('Image data URL:', e.target.result)
        const t2 = new Date()
        const timeElapsed = ((t2 - t1) / 1000).toFixed(1)
        updateConversations('IMAGE', e.target.result, timeElapsed, stepNumber)
      }
      reader.readAsDataURL(data);
    }

    function textHandler(data) {
      const t2 = new Date()
      const timeElapsed = ((t2 - t1) / 1000).toFixed(1)
      const dto = JSON.parse(data)
      console.log("Text response received:", dto.response_type)
      stepNumber++

      updateConversations(dto.response_type, dto.response, timeElapsed, stepNumber)
    }

    function updateConversations(type, data, timeElapsed, stepNumber) {
      setConversations((prevConversations) => {
        const index = prevConversations.findIndex(conversation => +conversation.start === +t1);
        const _newConversation = { ...prevConversations[index] };
        _newConversation.responses.push({ type, data, timeElapsed, stepNumber })
        return [
          ...prevConversations.slice(0, index),
          _newConversation,
          ...prevConversations.slice(index + 1)
        ];
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="overflow-y-scroll flex-grow p-2">
        {conversations.map((conversation, index) => (
          <div key={index} className="mb-5">
            <p>{conversation.start.toLocaleString()} <span className="font-bold">{conversation.query} ({conversation.model}, {conversation.domain})</span>:</p>
            {conversation.responses
              .filter((response, respIndex, responses) => responses.findIndex(r => r.stepNumber === response.stepNumber) === respIndex)
              .map((response, respIndex) => {
                const isFolded = foldStates[`${index}-${respIndex}`] || false;
                const handleToggle = () => {
                  setFoldStates(prev => ({ ...prev, [`${index}-${respIndex}`]: !isFolded }));
                };

                return (
                  <div key={index * 1000 + respIndex} className="mb-2">
                    <button
                      onClick={handleToggle}
                      className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-600 shadow-md"
                      style={{ backgroundColor: '#1E40AF', padding: '0.5rem 1rem', marginBottom: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                    >
                      {response.type}
                    </button>
                    {isFolded && (
                      response.type === 'IMAGE' ? (
                        <img className="mt-2" src={response.data} alt="From API" />
                      ) : response.type === 'DATA' ? (
                        <table className="mt-2 table-auto border-collapse border border-gray-400">
                          <tbody>
                            {response.data.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border border-gray-400">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border border-gray-400 p-2">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : response.type === 'SQL' ? (
                        <pre className="mt-2 bg-gray-100 p-2 rounded border border-gray-300 whitespace-pre-wrap">
                          {response.data}
                        </pre>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap">{response.data}</p>
                      )
                    )}
                  </div>
                );
              })
            }
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 bg-gray-800 text-white">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-start space-x-4">
            <div className="flex flex-col items-start" style={{ marginRight: '1rem' }}>
              <label className="text-black" style={{ color: 'black', display: 'block', width: 'auto' }}>Domain:</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="p-2 bg-gray-300 text-black rounded-md"
                style={{ fontSize: '22px', height: '40px', color: 'black' }}
              >
                <option value="PA">Public Assistance</option>
                <option value="QPR_HIST">Road to Recovery</option>
              </select>
            </div>
            <div className="flex flex-col items-start" style={{ marginRight: '1rem' }}>
              <label className="text-black" style={{ color: 'black', display: 'block', width: 'auto' }}>Model:</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="p-2 bg-gray-300 text-black rounded-md"
                style={{ fontSize: '22px', height: '40px', color: 'black' }}
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="MISTRAL">MISTRAL</option>
                <option value="GROQ">GROQ</option>
              </select>
            </div>
            <div className="flex flex-col" style={{ marginRight: '1rem', marginLeft: '0' }}>
              <label className="text-black" style={{ color: 'black', display: 'block', width: 'auto' }}>Query:</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="p-2 bg-gray-300 text-black rounded-md"
                style={{ fontSize: '18px', color: 'black', height: '40px', width: '500px' }}
                placeholder="Enter your query here"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col items-start">
              <label style={{ color: 'black', display: 'block', width: 'auto' }}>&nbsp;</label>
              <button type="submit" className="bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                style={{ paddingLeft: '1rem', paddingRight: '1rem', height: '40px', marginLeft: '0' }}>Send</button>
            </div>
          </div>
        </form>
      </div>
    </div >
  );
}
