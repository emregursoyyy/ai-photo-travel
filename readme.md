# 🆓 AI Photo Travel - Tamamen Ücretsiz Web Uygulaması

**Dünyanın her yerinde ol, hayallerini gerçekleştir - Hiçbir ücret ödemeden!**

## ✨ Özellikler:

✅ **Tamamen Ücretsiz**: API key gerekmez, hiçbir ödeme yok
✅ **Modern UI/UX**: iOS tarzı kaliteli tasarım
✅ **Akıllı Kategori Seçimi**: Şehirler, Oteller, Doğa, Simgeler
✅ **Popüler Lokasyonlar**: 24 farklı destinasyon
✅ **Gelişmiş Parametreler**: Hava durumu, zaman, kalabalık, kalite
✅ **Responsive Tasarım**: Tüm cihazlarda mükemmel çalışır
✅ **PWA Desteği**: Native app gibi kullanın
✅ **Offline Çalışma**: İnternet olmadan da temel özellikler

## 📱 Kullanım:

1. **Fotoğraf Yükle**: Selfie çekin veya galeriden seçin
2. **Lokasyon Seç**: 24 popüler destinasyon arasından seçin
3. **Özelleştir**: Hava durumu, zaman, kalabalık seviyesi
4. **Oluştur**: AI anında işler

## 🤖 AI Teknolojileri:

- **Arka Plan Kaldırma**: Yerel Canvas API ile akıllı işleme
- **Arka Plan Oluşturma**: Pollinations AI (ücretsiz) + Yerel fallback
- **Akıllı Prompt**: Parametrelere göre otomatik optimizasyon
- **Görüntü Birleştirme**: Canvas API ile profesyonel sonuçlar

## 🌐 Deployment:

### Cloudflare Pages (Önerilen - Ücretsiz):
1. GitHub repository oluşturun ve kodu push edin
2. cloudflare.com/pages'de hesap açın
3. GitHub repo'yu bağlayın
4. **Environment Variables** ayarlayın:
   - `HUGGING_FACE_TOKEN`: Hugging Face API token'ınız
   - `REPLICATE_TOKEN`: (Opsiyonel) Replicate API token
   - `REMOVEBG_TOKEN`: (Opsiyonel) Remove.bg API token
5. Build ayarları:
   - Build command: `npm run build`
   - Build output directory: `./`
6. Deploy edin - Otomatik SSL + Global CDN + Sınırsız bant genişliği!

**🔒 Güvenlik**: API token'ları environment variable olarak saklanır, kodda görünmez!

### GitHub Pages (Ücretsiz):
1. Repository oluşturun
2. Dosyaları yükleyin
3. Settings > Pages > Deploy from branch
4. `https://username.github.io/repository-name` adresinden erişin

### Netlify (Ücretsiz):
1. netlify.com'da hesap açın
2. Drag & drop ile dosyaları yükleyin
3. Otomatik URL alın

### Vercel (Ücretsiz):
1. vercel.com'da hesap açın
2. GitHub repo'yu bağlayın
3. Otomatik deploy

## 💡 Teknik Detaylar:

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **AI API**: Pollinations (ücretsiz, sınırsız)
- **Fallback**: Canvas-based yerel işleme
- **Storage**: LocalStorage (offline destek)
- **PWA**: Service Worker ile cache

## 🚀 Canlı Demo:

Uygulamayı hemen test edin - hiçbir kurulum gerekmez!

## 📄 Lisans:

MIT License - Tamamen açık kaynak ve ücretsiz kullanım