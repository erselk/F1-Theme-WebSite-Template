'use client';

import React, { useState, useEffect, FormEvent } from 'react';

interface SimulatorPrice {
  id: string;
  name: string;
  pricePerHour: number;
}

interface PriceData {
  simulators: SimulatorPrice[];
}

export default function AdminPricingPage() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/update-prices');
      if (!response.ok) {
        throw new Error('Fiyatlar yüklenemedi');
      }
      const data: PriceData = await response.json();
      setPriceData(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    if (!priceData) return;

    const newValue = parseFloat(value);
    if (isNaN(newValue) || newValue < 0) return;

    setPriceData(prevData => {
      if (!prevData) return null;
      let updatedData = JSON.parse(JSON.stringify(prevData));

      const simIndex = updatedData.simulators.findIndex((sim: SimulatorPrice) => sim.id === id);
      if (simIndex > -1) {
        updatedData.simulators[simIndex].pricePerHour = newValue;
      }
      return updatedData;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!priceData) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/update-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fiyatlar güncellenemedi');
      }
      setSuccessMessage('Fiyatlar başarıyla güncellendi!');
      fetchPrices();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-4">Yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-500">Hata: {error} <button onClick={fetchPrices} className="ml-2 p-1 bg-blue-500 text-white rounded">Tekrar Dene</button></div>;
  if (!priceData || !priceData.simulators) return <div className="p-4">Fiyat verisi bulunamadı.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Fiyat Yönetimi</h1>
      
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Simülatör Saatlik Fiyatları</h2>
          <div className="space-y-4">
            {priceData.simulators.map((sim) => (
              <div key={sim.id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <label 
                  htmlFor={`sim_${sim.id}`} 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:w-1/3 sm:min-w-[150px] truncate"
                  title={`${sim.name}`}
                >
                  {sim.name}
                </label>
                <div className="flex items-center space-x-2 w-full sm:w-2/3">
                  <input 
                    type="number"
                    id={`sim_${sim.id}`}
                    value={sim.pricePerHour}
                    onChange={(e) => handleInputChange(sim.id, e.target.value)}
                    className="p-2 border rounded w-full sm:max-w-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    step="0.01"
                    min="0"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">TL / Saat</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
        </button>
      </form>
    </div>
  );
} 