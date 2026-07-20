import { useState, useCallback, useRef, useEffect } from 'react';

export function useBarcode({ onScan, onError, enabled = true } = {}) {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);

  // Camera-based scanning
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      if (onError) onError('Camera access denied or unavailable');
      // Fallback to manual input
      inputRef.current?.focus();
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setScanning(false);
  }, [cameraStream]);

  // Manual barcode input with debounce
  const handleManualInput = useCallback((e) => {
    const value = e.target.value;
    setBarcode(value);
    bufferRef.current = value;

    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-detect barcode scan (fast input, usually from scanner)
    timeoutRef.current = setTimeout(() => {
      if (bufferRef.current.length >= 8 && enabled) {
        onScan?.(bufferRef.current);
        setBarcode('');
        bufferRef.current = '';
      }
    }, 100);
  }, [onScan, enabled]);

  // Handle barcode scanner gun (Enter key after scan)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && bufferRef.current.length >= 3 && enabled) {
      e.preventDefault();
      onScan?.(bufferRef.current);
      setBarcode('');
      bufferRef.current = '';
    }
  }, [onScan, enabled]);

  // Reset barcode
  const reset = useCallback(() => {
    setBarcode('');
    bufferRef.current = '';
  }, []);

  // Focus input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stopCamera]);

  return {
    barcode,
    scanning,
    videoRef,
    inputRef,
    startCamera,
    stopCamera,
    handleManualInput,
    handleKeyDown,
    reset,
    focusInput,
  };
}