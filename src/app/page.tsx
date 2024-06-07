"use client"

import React, { useState, useRef } from 'react';

export default function MyApp() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const startTime = new Date()
    const newConversation = { query: input, startTime, responses: [] }
    setConversations((prevConversations) => [...prevConversations, newConversation]);

    try {
      await invokeServerAPI(input, textHandler)
    }
    finally {
      setInput('');
    }

    function textHandler(text) {
      console.log("Text response received:", text)
      updateCurrentConversation(text)
    }

    function updateCurrentConversation(data) {
      setConversations((prevConversations) => {
        console.log('Invoke updateCurrentConversation with response: ', data)
        const index = prevConversations.findIndex(conversation => conversation.startTime === startTime);
        const _newConversation = { ...prevConversations[index] };
        _newConversation.responses.push({ data })
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
            <p>{conversation.startTime.toLocaleString()} <span className="font-bold">{conversation.query})</span>:</p>
            {conversation.responses
              .map((response, respIndex) => {
                return (
                  <div key={index * 1000 + respIndex} className="mb-2">
                      <pre className="mt-2 bg-gray-100 p-2 rounded border border-gray-300 whitespace-pre-wrap">{response.data}</pre>
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
            <div className="flex flex-col" style={{ marginRight: '1rem', marginLeft: '0' }}>
              <label className="text-black" style={{ color: 'black', display: 'block', width: 'auto' }}>Query:</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="p-2 bg-gray-300 text-black rounded-md"
                style={{ fontSize: '18px', color: 'black', height: '40px', width: '500px' }}
                placeholder="Enter your query here"
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

export function invokeServerAPI(theQuery, theHandler) {

  return new Promise((resolve, reject) => {

    //simulate just one response
    theHandler('Response for query:' + theQuery)
    resolve(null);
  })
}