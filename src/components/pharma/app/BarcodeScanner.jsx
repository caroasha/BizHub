import { useState, useRef } from 'react';
import { useBarcode } from '../../../hooks/useBarcode';
import { getMedicines } from '../../../api/pharma/medicines';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';
import { formatCurrency } from '../../../utils/format';
import { Camera, X, Search } from 'lucide-react';

export function BarcodeScanner({ tenantId, onSelect }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (code) => {
    if (!code || code.length < 3) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getMedicines({ search: code, limit: 1 });
      const found = res?.data?.[0];
      if (found) {
        setResult(found);
        onSelect?.(found);
      } else {
        setError('No medicine found');
      }
    } catch { setError('Search failed'); }
    setLoading(false);
  };

  const { barcode, scanning, videoRef, inputRef, startCamera, stopCamera, handleManualInput, handleKeyDown, reset } = useBarcode({ onScan: handleScan });

  const toggleCamera = () => {
    if (showCamera) {
      stopCamera();
      setShowCamera(false);
    } else {
      setShowCamera(true);
      startCamera();
    }
  };

  return (
    <div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={handleManualInput}
          onKeyDown={handleKeyDown}
          placeholder="Scan barcode or search..."
          className="w-full pl-9 pr-16 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {barcode && (
            <button onClick={reset} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={14} />
            </button>
          )}
          <button onClick={toggleCamera} className={`p-1.5 rounded-lg transition-colors ${showCamera ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title="Camera scan">
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Camera preview */}
      {showCamera && (
        <div className="relative mt-2 rounded-lg overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-40 object-cover" />
          {scanning && <div className="absolute inset-0 border-2 border-primary-500 animate-pulse" />}
          <button onClick={toggleCamera} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"><X size={14} /></button>
        </div>
      )}

      {loading && <div className="flex justify-center py-2"><Spinner size="sm" /></div>}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {result && (
        <Card className="mt-3 border-l-4 border-l-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{result.name}</h4>
              <p className="text-xs text-gray-500">{result.genericName} {result.dosage && `· ${result.dosage}`}</p>
            </div>
            <Badge color={result.stock > 0 ? 'green' : 'red'}>Stock: {result.stock}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div><p className="text-gray-500">Price</p><p className="font-bold text-gray-900 dark:text-white">{formatCurrency(result.sellingPrice)}</p></div>
            {result.expiryDate && <div><p className="text-gray-500">Expiry</p><p className="text-gray-900 dark:text-white">{new Date(result.expiryDate).toLocaleDateString()}</p></div>}
          </div>
        </Card>
      )}
    </div>
  );
}