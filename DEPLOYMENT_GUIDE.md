# 🚀 Cloudflare Pages Deployment Kılavuzu

## 📋 Ön Hazırlık

### 1. Hugging Face Token Alın
1. [huggingface.co](https://huggingface.co) adresinde hesap oluşturun
2. Settings > Access Tokens > New Token
3. Token'ı kopyalayın (hf_xxxxxxxxxx formatında)

### 2. Repository Hazırlayın
```bash
git add .
git commit -m "Add environment variable support"
git push origin main
```

## ☁️ Cloudflare Pages Kurulumu

### 1. Cloudflare Pages'e Giriş
1. [dash.cloudflare.com](https://dash.cloudflare.com) adresinde hesap oluşturun
2. **Pages** sekmesine gidin
3. **Create a project** butonuna tıklayın

### 2. Repository Bağlayın
1. **Connect to Git** seçin
2. GitHub hesabınızı bağlayın
3. Repository'nizi seçin
4. **Begin setup** butonuna tıklayın

### 3. Build Ayarları
```
Project name: ai-photo-editor
Production branch: main
Build command: npm run build
Build output directory: ./
```

### 4. Environment Variables Ekleyin
**Settings > Environment variables** bölümünde:

#### Production Environment:
- **Variable name**: `HUGGING_FACE_TOKEN`
- **Value**: `hf_your_actual_token_here`
- **Encrypt**: ✅ (Önemli!)

#### Opsiyonel Tokenlar:
- `REPLICATE_TOKEN`: Replicate API token (opsiyonel)
- `REMOVEBG_TOKEN`: Remove.bg API token (opsiyonel)

### 5. Deploy Edin
1. **Save and Deploy** butonuna tıklayın
2. Build işlemini bekleyin (1-2 dakika)
3. Deployment tamamlandığında URL'nizi alın

## 🔧 Build Süreci Nasıl Çalışır?

1. **build.js** scripti çalışır
2. Environment variable'lar HTML dosyasına inject edilir
3. `{{HUGGING_FACE_TOKEN}}` placeholder'ı gerçek token ile değiştirilir
4. İşlenmiş dosya `index.html` olarak kaydedilir
5. Cloudflare Pages dosyayı serve eder

## 🔒 Güvenlik Avantajları

✅ **API token'lar kodda görünmez**
✅ **Git repository'de token yok**
✅ **Environment variable'lar şifreli**
✅ **Build-time injection güvenli**
✅ **Runtime'da token erişimi yok**

## 🚨 Sorun Giderme

### Build Hatası
```bash
# Yerel test için:
npm run build
```

### Token Çalışmıyor
1. Hugging Face token'ın doğru olduğunu kontrol edin
2. Token'ın `hf_` ile başladığından emin olun
3. Cloudflare'de environment variable'ın doğru yazıldığını kontrol edin

### Deployment Sonrası Test
1. Browser Developer Tools > Network sekmesini açın
2. Fotoğraf yükleyip işleme başlatın
3. API çağrılarının başarılı olduğunu kontrol edin

## 📈 Performans İpuçları

- Cloudflare'in global CDN'i sayesinde dünya çapında hızlı erişim
- Otomatik SSL sertifikası
- Sınırsız bant genişliği
- Otomatik cache optimizasyonu

## 🔄 Güncelleme Süreci

1. Kod değişikliklerini yapın
2. Git'e push edin
3. Cloudflare otomatik olarak yeniden deploy eder
4. Environment variable'lar korunur

---

**🎉 Tebrikler!** Artık AI Photo Editor uygulamanız güvenli bir şekilde Cloudflare Pages'te çalışıyor!