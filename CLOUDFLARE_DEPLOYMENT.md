# 🚀 Cloudflare Pages Deployment Rehberi

## Adım 1: Cloudflare Pages'e Giriş

1. [Cloudflare Dashboard](https://dash.cloudflare.com)'a gidin
2. **Pages** sekmesine tıklayın
3. **Create a project** butonuna tıklayın
4. **Connect to Git** seçeneğini seçin

## Adım 2: GitHub Repository Bağlantısı

1. **GitHub** seçeneğini seçin
2. GitHub hesabınızla giriş yapın
3. **ai-photo-travel** repository'sini seçin
4. **Begin setup** butonuna tıklayın

## Adım 3: Build Ayarları

### Project Ayarları:
- **Project name**: `ai-photo-travel`
- **Production branch**: `main`

### Build Ayarları:
- **Framework preset**: `None` (Static site)
- **Build command**: `npm run build`
- **Build output directory**: `/` (root directory)
- **Root directory**: `/` (root directory)

## Adım 4: Environment Variables (ÇOK ÖNEMLİ!)

⚠️ **Bu adım olmadan uygulama çalışmaz!**

1. **Environment variables** bölümüne gidin
2. Aşağıdaki değişkeni ekleyin:

```
Variable name: HUGGING_FACE_TOKEN
Value: [Hugging Face token'ınızı buraya yazın]
Environment: Production (ve Preview)
```

### Hugging Face Token Nasıl Alınır:

1. [Hugging Face](https://huggingface.co) hesabı oluşturun (ücretsiz)
2. [Settings > Access Tokens](https://huggingface.co/settings/tokens) sayfasına gidin
3. **New token** butonuna tıklayın
4. Token adı verin (örn: "AI Photo Travel")
5. **Role**: `Read` seçin
6. **Create token** butonuna tıklayın
7. Token'ı kopyalayın ve Cloudflare'de environment variable olarak ekleyin

## Adım 5: Deploy

1. **Save and Deploy** butonuna tıklayın
2. Build işlemi başlayacak (2-3 dakika sürer)
3. Build tamamlandığında siteniz canlı olacak!

## Adım 6: Domain

Cloudflare otomatik olarak şu formatta bir URL verecek:
```
https://ai-photo-travel.pages.dev
```

### Custom Domain (İsteğe Bağlı)

Kendi domain'iniz varsa:
1. **Custom domains** sekmesine gidin
2. **Set up a custom domain** butonuna tıklayın
3. Domain'inizi girin ve DNS ayarlarını yapın

## ✅ Özellikler

- **Otomatik SSL Sertifikası**
- **Global CDN** (Dünya çapında hızlı erişim)
- **Sınırsız Bant Genişliği**
- **Otomatik Deploy** (GitHub'a push yaptığınızda)
- **Preview URLs** (Her commit için)
- **DDoS Koruması**
- **Edge Computing** (Cloudflare Workers)

## 🔄 Güncelleme

Kod değişikliği yapmak için:

```bash
# Değişiklik yapın
git add .
git commit -m "Güncelleme mesajı"
git push
```

Cloudflare otomatik olarak yeni versiyonu deploy edecek!

## 🎉 Tebrikler!

AI Photo Travel uygulamanız artık canlı ve dünya çapında erişilebilir!

### Paylaşım Linkleri:
- **Ana Site**: https://ai-photo-travel.pages.dev
- **GitHub**: https://github.com/emregursoyyy/ai-photo-travel

---

## 🔧 Sorun Giderme

### Build Başarısız Olursa:
1. Environment variable'ın doğru eklendiğinden emin olun
2. Build command'ın `npm run build` olduğunu kontrol edin
3. Cloudflare Pages loglarını kontrol edin

### Site Açılmıyorsa:
1. Build'in başarılı olduğunu kontrol edin
2. Environment variable'ın Production ve Preview'da ekli olduğunu kontrol edin
3. Browser cache'ini temizleyin

### API Çalışmıyorsa:
1. Hugging Face token'ının geçerli olduğunu kontrol edin
2. Token'ın `Read` yetkisine sahip olduğunu kontrol edin
3. Browser Developer Tools'da Console hatalarını kontrol edin

**⚠️ Önemli:** Token'ınızı asla kod içinde yazmayın, sadece Cloudflare Pages environment variables kullanın!