# 🚀 Cloudflare Pages Deployment Rehberi

## Adım 1: GitHub Repository Oluşturma

✅ **Tamamlandı!** Git repository'si hazır ve commit yapıldı.

### Şimdi GitHub'da repository oluşturun:

1. **GitHub.com**'a gidin ve giriş yapın
2. **"New repository"** butonuna tıklayın
3. Repository adı: `ai-photo-travel` (veya istediğiniz isim)
4. **Public** olarak ayarlayın (ücretsiz hosting için gerekli)
5. **"Create repository"** butonuna tıklayın

### Kodu GitHub'a yükleyin:

```bash
# GitHub hesap bilgilerinizi kullanın
git remote add origin https://github.com/emregursoyyy/ai-photo-travel.git
git branch -M main
git push -u origin main
```

## Adım 2: Cloudflare Pages Kurulumu

### 2.1 Cloudflare Hesabı

1. **[cloudflare.com](https://cloudflare.com)** adresine gidin
2. **"Sign up"** ile ücretsiz hesap oluşturun
3. Email doğrulaması yapın

### 2.2 Pages Kurulumu

1. Cloudflare Dashboard'da **"Pages"** sekmesine gidin
2. **"Create a project"** butonuna tıklayın
3. **"Connect to Git"** seçeneğini seçin
4. **GitHub** hesabınızı bağlayın
5. **Repository seçin**: `ai-photo-travel`
6. **Deploy ayarları**:
   - **Project name**: `ai-photo-travel` (veya istediğiniz isim)
   - **Production branch**: `main`
   - **Build command**: Boş bırakın (statik site)
   - **Build output directory**: Boş bırakın
7. **"Save and Deploy"** butonuna tıklayın

## Adım 3: Deployment Sonrası

### 3.1 Otomatik URL

Cloudflare otomatik olarak şu formatta bir URL verecek:
```
https://ai-photo-travel.pages.dev
```

### 3.2 Custom Domain (İsteğe Bağlı)

Kendi domain'iniz varsa:
1. Pages projesinde **"Custom domains"** sekmesine gidin
2. **"Set up a custom domain"** butonuna tıklayın
3. Domain'inizi girin ve DNS ayarlarını yapın

## Adım 4: Özellikler

✅ **Otomatik SSL Sertifikası**
✅ **Global CDN** (Dünya çapında hızlı erişim)
✅ **Sınırsız Bant Genişliği**
✅ **Otomatik Deploy** (GitHub'a push yaptığınızda)
✅ **Preview URLs** (Her commit için)
✅ **DDoS Koruması**

## Adım 5: Güncelleme

Kod değişikliği yapmak için:

```bash
# Değişiklik yapın
git add .
git commit -m "Güncelleme mesajı"
git push
```

Cloudflare otomatik olarak yeni versiyonu deploy edecek!

## 🔐 Environment Variables (Güvenlik)

### Cloudflare Pages için:
1. Cloudflare Dashboard'da projenizi seçin
2. **Settings** > **Environment variables** bölümüne gidin
3. Aşağıdaki değişkeni ekleyin:
   - **Variable name:** `HUGGING_FACE_TOKEN`
   - **Value:** Hugging Face token'ınız
   - **Environment:** Production (ve Preview)

### Vercel için:
1. Vercel Dashboard'da projenizi seçin
2. **Settings** > **Environment Variables** bölümüne gidin
3. Aşağıdaki değişkeni ekleyin:
   - **Name:** `HUGGING_FACE_TOKEN`
   - **Value:** Hugging Face token'ınız
   - **Environment:** Production, Preview, Development

### Netlify için:
1. Netlify Dashboard'da sitenizi seçin
2. **Site settings** > **Environment variables** bölümüne gidin
3. **Add a variable** butonuna tıklayın:
   - **Key:** `HUGGING_FACE_TOKEN`
   - **Value:** Hugging Face token'ınız

**⚠️ Önemli:** Token'ınızı asla kod içinde yazmayın, sadece environment variables kullanın!

### Build Process (Otomatik Token Injection)

Proje artık environment variable'ları otomatik olarak inject eden bir build sistemi kullanıyor:

1. **Yerel geliştirme için:**
   ```bash
   # .env dosyası oluşturun (örnek: .env.example)
   HUGGING_FACE_TOKEN=your_actual_token_here
   
   # Build çalıştırın
   npm run build
   ```

2. **Deployment platformları otomatik olarak:**
   - Environment variable'ları alır
   - Build sırasında config.js'e inject eder
   - Token'lar güvenli şekilde runtime'da kullanılır

**Avantajları:**
- ✅ Token'lar kod içinde görünmez
- ✅ Git history'sinde token yok
- ✅ Her platform için aynı kod
- ✅ Otomatik build process

## 🎉 Tebrikler!

AI Photo Travel uygulamanız artık canlı ve dünya çapında erişilebilir!

### Paylaşım Linkleri:
- **Ana Site**: https://ai-photo-travel.pages.dev
- **GitHub**: https://github.com/KULLANICI_ADINIZ/ai-photo-travel

---

## Sorun Giderme

### Deployment Başarısız Olursa:
1. GitHub repository'sinin public olduğundan emin olun
2. `index.html` dosyasının root dizinde olduğunu kontrol edin
3. Cloudflare Pages loglarını kontrol edin

### Site Açılmıyorsa:
1. DNS propagation bekleyin (5-10 dakika)
2. Tarayıcı cache'ini temizleyin
3. Farklı tarayıcıda deneyin

### Güncelleme Yansımıyorsa:
1. GitHub'da commit'in görünür olduğunu kontrol edin
2. Cloudflare Pages'de deployment loglarını kontrol edin
3. Cache temizleme: Cloudflare Dashboard > Caching > Purge Everything