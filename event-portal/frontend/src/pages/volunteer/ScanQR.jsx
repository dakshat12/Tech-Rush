import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axiosInstance from '../../api/axiosInstance';

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('check_in');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScanning = async () => {
    setError('');
    setResult(null);
    setScanning(true);

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrRef.current = html5QrCode;

    try {
      // Get list of available cameras on this device
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        throw new Error('No camera found on this device');
      }

      // Prefer a back/rear camera if one exists (phones), otherwise just use the first available (laptops)
      const rearCamera = devices.find((d) => /back|rear|environment/i.test(d.label));
      const cameraId = rearCamera ? rearCamera.id : devices[0].id;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);
          await handleCheckIn(decodedText);
        },
        () => {} // ignore per-frame scan failures (normal while camera searches)
      );
    } catch (err) {
      setError(err.message || 'Could not access camera. Make sure you granted camera permission.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch (err) {
        // already stopped, ignore
      }
    }
    setScanning(false);
  };

  const handleCheckIn = async (qrToken) => {
    try {
      const res = await axiosInstance.post('/checkin', { qrToken, type: mode });
      setResult({
        success: true,
        message: res.data.message,
        attendeeName: res.data.attendeeName,
        eventTitle: res.data.eventTitle,
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.error || 'Check-in failed',
      });
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Scan Attendee QR Code</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>
          <input type="radio" checked={mode === 'check_in'} onChange={() => setMode('check_in')} /> Check In
        </label>
        <label>
          <input type="radio" checked={mode === 'check_out'} onChange={() => setMode('check_out')} /> Check Out
        </label>
      </div>

      {!scanning && (
        <button onClick={startScanning} style={{ padding: '10px 20px' }}>
          Start Scanning
        </button>
      )}
      {scanning && (
        <button onClick={stopScanning} style={{ padding: '10px 20px' }}>
          Stop Scanning
        </button>
      )}

      <div id="qr-reader" ref={scannerRef} style={{ marginTop: 16 }} />

      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
            background: result.success ? '#e8f5e9' : '#ffebee',
            color: result.success ? '#2e7d32' : '#c62828',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{result.message}</p>
          {result.success && (
            <p style={{ margin: '4px 0 0 0' }}>
              {result.attendeeName} — {result.eventTitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanQR;
