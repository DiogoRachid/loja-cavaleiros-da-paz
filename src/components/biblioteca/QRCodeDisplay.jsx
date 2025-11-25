import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function QRCodeDisplay({ value, itemName, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      generateQRCode();
    }
  }, [value, size]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Usando uma biblioteca simples de QR Code via URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = qrUrl;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `qr-${itemName || 'item'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${itemName}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h2 { margin-bottom: 20px; color: #1B3A5F; }
            p { font-size: 12px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>${itemName}</h2>
          <img src="${canvas.toDataURL('image/png')}" />
          <p>${value}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas 
        ref={canvasRef} 
        className="border rounded-lg bg-white p-2"
        style={{ width: size, height: size }}
      />
      <p className="text-xs text-slate-500 font-mono">{value}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-1" />
          Baixar
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}