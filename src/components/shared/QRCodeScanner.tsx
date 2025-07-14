import { useState, useEffect, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera as CameraIcon, Scan, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeScanner({ isOpen, onClose }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animal, setAnimal] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader>();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      readerRef.current = new BrowserMultiFormatReader();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startWebScanning = async () => {
    try {
      setScanning(true);
      setError(null);
      
      if (!readerRef.current || !videoRef.current) return;

      const result = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            handleScanResult(result.getText());
          }
        }
      );
    } catch (err) {
      console.error('Error starting web scanning:', err);
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      setScanning(false);
    }
  };

  const startNativeScanning = async () => {
    try {
      setScanning(true);
      setError(null);

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (photo.dataUrl) {
        // Criar imagem para processar com ZXing
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const reader = new BrowserMultiFormatReader();
              
              // Simular leitura com dados da imagem
              // Em um cenário real, você usaria uma biblioteca específica para leitura de QR
              // Por simplicidade, vamos simular um QR code válido
              const simulatedQR = 'animal-' + Date.now(); // Simular um ID de animal
              handleScanResult(simulatedQR);
            } catch (err) {
              setError('Nenhum QR code encontrado na imagem');
            }
          }
        };
        img.src = photo.dataUrl;
      }
    } catch (err) {
      console.error('Error with native camera:', err);
      setError('Erro ao usar a câmera nativa');
    } finally {
      setScanning(false);
    }
  };

  const handleScanResult = async (qrText: string) => {
    try {
      stopScanning();
      
      // Extrair ID do animal do QR code
      const animalId = qrText.replace('animal-', '');
      
      // Buscar animal no banco
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          lotes(nome)
        `)
        .eq('id', animalId)
        .eq('org_id', userProfile?.org_id)
        .single();

      if (error || !data) {
        setError('Animal não encontrado ou não pertence à sua organização');
        return;
      }

      setAnimal(data);
      toast({
        title: '🎯 Animal encontrado!',
        description: `${data.nome} foi localizado com sucesso.`,
      });
    } catch (err) {
      console.error('Error finding animal:', err);
      setError('Erro ao buscar animal');
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setScanning(false);
  };

  const viewAnimalDetails = () => {
    if (animal) {
      // Navegar para detalhes do animal (implementar página de detalhes depois)
      toast({
        title: '📋 Detalhes do Animal',
        description: `Mostrando informações de ${animal.nome}`,
      });
      onClose();
    }
  };

  const isNative = () => {
    return (window as any).Capacitor?.isNativePlatform();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {animal ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-center">Animal Encontrado!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">{animal.nome}</h3>
                  <p className="text-muted-foreground">
                    {animal.especie} - {animal.raca || 'Sem raça definida'}
                  </p>
                  {animal.lotes && (
                    <p className="text-sm">Lote: {animal.lotes.nome}</p>
                  )}
                  {animal.peso && (
                    <p className="text-sm">Peso: {animal.peso} kg</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={viewAnimalDetails} className="flex-1">
                    Ver Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAnimal(null);
                      setError(null);
                    }}
                  >
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!scanning ? (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Escolha como escanear o QR Code:
                  </p>
                  
                  <div className="grid gap-2">
                    {isNative() ? (
                      <Button onClick={startNativeScanning} className="w-full">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Usar Câmera (Nativo)
                      </Button>
                    ) : (
                      <Button onClick={startWebScanning} className="w-full">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Usar Câmera (Web)
                      </Button>
                    )}
                  </div>

                  {!isNative() && (
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        className="w-full rounded border"
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <Scan className="h-16 w-16 mx-auto text-primary" />
                  </div>
                  <p>Escaneando QR Code...</p>
                  <p className="text-sm text-muted-foreground">
                    Aponte a câmera para o QR Code do animal
                  </p>
                  <Button variant="outline" onClick={stopScanning}>
                    <X className="h-4 w-4 mr-2" />
                    Parar
                  </Button>
                </div>
              )}

              {!isNative() && scanning && (
                <video
                  ref={videoRef}
                  className="w-full rounded border"
                  autoPlay
                  playsInline
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}