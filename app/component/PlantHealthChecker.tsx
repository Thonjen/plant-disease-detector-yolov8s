'use client';

import { useState, useRef } from 'react';

interface AnalysisResult {
  isPlant: boolean;
  isHealthy: boolean;
  confidence: string;
  details: string;
}

export default function PlantHealthChecker() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (imageDataUrl: string): string => {
    // Remove the data:image/[type];base64, prefix
    return imageDataUrl.split(',')[1];
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Image = convertImageToBase64(selectedImage);
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is required');
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this image and determine:
1. Is this a plant? (yes/no)
2. If it's a plant, is it healthy or diseased?
3. Provide your confidence level (high/medium/low)
4. Give a brief explanation of your assessment

Please respond in this exact JSON format:
{
  "isPlant": true/false,
  "isHealthy": true/false (only if isPlant is true),
  "confidence": "high/medium/low",
  "details": "Brief explanation of what you see and your assessment"
}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Try to parse JSON response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          setResult(parsedResult);
        } else {
          // Fallback: parse text response
          const isPlant = aiResponse.toLowerCase().includes('plant') && 
                         !aiResponse.toLowerCase().includes('not a plant');
          const isHealthy = aiResponse.toLowerCase().includes('healthy') && 
                           !aiResponse.toLowerCase().includes('not healthy') &&
                           !aiResponse.toLowerCase().includes('diseased');
          
          setResult({
            isPlant,
            isHealthy: isPlant ? isHealthy : false,
            confidence: 'medium',
            details: aiResponse
          });
        }
      } catch (parseError) {
        // If JSON parsing fails, create result from text
        const isPlant = aiResponse.toLowerCase().includes('plant');
        const isHealthy = aiResponse.toLowerCase().includes('healthy');
        
        setResult({
          isPlant,
          isHealthy: isPlant ? isHealthy : false,
          confidence: 'medium',
          details: aiResponse
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">🤖</span>
            <h2 className="text-2xl font-bold">AI Plant Health Checker</h2>
          </div>
          <p className="text-center text-emerald-100">
            Upload a plant image and let Gemini AI determine if it's healthy or diseased
          </p>

        </div>

        <div className="p-6">
          {/* Upload Section */}
          {!selectedImage && (
            <div className="text-center">
              <div 
                className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  🌱
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Upload Plant Image
                </h3>
                <p className="text-gray-500 mb-4">
                  Click here or drag and drop your plant image
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                  <span>Choose Image</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Image Preview and Analysis */}
          {selectedImage && (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="text-center">
                <div className="relative inline-block rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Analyze Plant Health</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                >
                  <span>↻</span>
                  <span>Reset</span>
                </button>
              </div>

              {/* Results */}
              {result && (
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl border border-emerald-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    Analysis Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className={`p-4 rounded-xl text-center ${result.isPlant ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
                      <div className="text-2xl mb-2">
                        {result.isPlant ? '🌿' : '❌'}
                      </div>
                      <div className="font-semibold text-gray-800">
                        {result.isPlant ? 'Plant Detected' : 'Not a Plant'}
                      </div>
                    </div>
                    
                    {result.isPlant && (
                      <div className={`p-4 rounded-xl text-center ${result.isHealthy ? 'bg-green-100 border border-green-200' : 'bg-yellow-100 border border-yellow-200'}`}>
                        <div className="text-2xl mb-2">
                          {result.isHealthy ? '💚' : '⚠️'}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {result.isHealthy ? 'Healthy' : 'Needs Attention'}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-xl text-center bg-blue-100 border border-blue-200">
                      <div className="text-2xl mb-2">📈</div>
                      <div className="font-semibold text-gray-800">
                        {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Detailed Analysis:</h4>
                    <p className="text-gray-600 leading-relaxed">{result.details}</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-100 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-800">
                    <span>⚠️</span>
                    <span className="font-semibold">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}