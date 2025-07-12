import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, RotateCcw, Save, Upload } from 'lucide-react';
import { useGlobalConfig } from '@/hooks/useGlobalConfig';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDesign() {
  const { config, updateConfig, loading } = useGlobalConfig();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    primary_color: '',
    secondary_color: '',
    background_color: '',
    font: '',
    layout_mode: 'light',
    app_title: '',
    app_slogan: '',
    logo_url: '',
    favicon_url: ''
  });

  useEffect(() => {
    if (config) {
      setFormData({
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        background_color: config.background_color,
        font: config.font,
        layout_mode: config.layout_mode,
        app_title: config.app_title,
        app_slogan: config.app_slogan,
        logo_url: config.logo_url || '',
        favicon_url: config.favicon_url || ''
      });
    }
  }, [config]);

  const handleSaveChanges = async () => {
    try {
      await updateConfig({
        ...formData,
        layout_mode: formData.layout_mode as 'light' | 'dark' | 'auto'
      });
      toast({
        title: "Sucesso",
        description: "Configurações de design atualizadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Tem certeza que deseja resetar todas as configurações para o padrão?')) {
      return;
    }

    const defaultConfigReset = {
      primary_color: '#1A73E8',
      secondary_color: '#6366f1',
      background_color: '#ffffff',
      font: 'Inter',
      layout_mode: 'light' as 'light' | 'dark' | 'auto',
      app_title: 'InfinityVet',
      app_slogan: 'Gestão Veterinária Inteligente',
      logo_url: '',
      favicon_url: ''
    };

    setFormData(defaultConfigReset);
    
    try {
      await updateConfig(defaultConfigReset);
      toast({
        title: "Sucesso",
        description: "Configurações resetadas para o padrão",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resetar as configurações",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design System Global
              </CardTitle>
              <CardDescription>
                Personalize o tema e branding do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetToDefault}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identidade da Marca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app_title">Título do App</Label>
                <Input
                  id="app_title"
                  value={formData.app_title}
                  onChange={(e) => setFormData({ ...formData, app_title: e.target.value })}
                  placeholder="InfinityVet"
                />
              </div>
              <div>
                <Label htmlFor="app_slogan">Slogan</Label>
                <Input
                  id="app_slogan"
                  value={formData.app_slogan}
                  onChange={(e) => setFormData({ ...formData, app_slogan: e.target.value })}
                  placeholder="Gestão Veterinária Inteligente"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url">URL do Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="favicon_url">URL do Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon_url"
                    value={formData.favicon_url}
                    onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#1A73E8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    placeholder="#6366f1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="background_color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipografia e Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="font">Fonte</Label>
                <Select
                  value={formData.font}
                  onValueChange={(value) => setFormData({ ...formData, font: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="layout_mode">Modo de Layout</Label>
                <Select
                  value={formData.layout_mode}
                  onValueChange={(value) => setFormData({ ...formData, layout_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <Card 
              className="p-6"
              style={{
                backgroundColor: formData.background_color,
                fontFamily: formData.font
              }}
            >
              <div 
                className="text-2xl font-bold mb-2"
                style={{ color: formData.primary_color }}
              >
                {formData.app_title}
              </div>
              <div 
                className="text-lg mb-4"
                style={{ color: formData.secondary_color }}
              >
                {formData.app_slogan}
              </div>
              <Button 
                style={{ 
                  backgroundColor: formData.primary_color,
                  borderColor: formData.primary_color
                }}
              >
                Botão de Exemplo
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}