'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeCanvas({ valor, tamano = 96 }: { valor: string; tamano?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, valor, {
      width: tamano,
      margin: 0,
      color: { dark: '#211F1C', light: '#00000000' },
    });
  }, [valor, tamano]);

  return <canvas ref={canvasRef} width={tamano} height={tamano} />;
}
