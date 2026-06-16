import React, { createContext, useContext, useState } from 'react';

const BatchContext = createContext();

export function BatchProvider({ children }) {
  const [batches, setBatches] = useState([
    // Sample data so processing unit has something to see
    {
      id: 'ERVAS-1781596213700',
      herbName: 'Tulsi',
      quantity: '1',
      quantityType: 'bunch',
      location: { lat: '13.03432', lng: '80.21549' },
      timestamp: '6/16/2026, 1:20:13 PM',
      status: 'pending_processing',
      notes: 'Fresh and green, good quality'
    }
  ]);

  const addBatch = (batch) => {
    setBatches(prev => [...prev, batch]);
  };

  const updateBatchStatus = (id, status) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <BatchContext.Provider value={{ batches, addBatch, updateBatchStatus }}>
      {children}
    </BatchContext.Provider>
  );
}

export function useBatches() {
  return useContext(BatchContext);
}