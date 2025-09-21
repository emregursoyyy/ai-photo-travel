// Bu dosya deployment sırasında otomatik olarak oluşturulacak
// Environment variable'ları buraya inject edilecek

window.APP_CONFIG = {
    // Hugging Face token - deployment sırasında değiştirilecek
    HUGGING_FACE_TOKEN: '{{HUGGING_FACE_TOKEN}}', // Build sırasında değiştirilecek
    
    // Ücretsiz API alternatifleri
    FALLBACK_APIS: {
        // Pollinations - Tamamen ücretsiz AI görüntü oluşturma
        pollinations: 'https://image.pollinations.ai/prompt/',
        
        // Hugging Face ücretsiz inference API'leri
        backgroundRemoval: 'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
        imageGeneration: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        
        // Yerel işleme için Canvas API kullanımı
        useLocalProcessing: true
    },
    
    // Rate limiting ayarları
    RATE_LIMITS: {
        requestsPerMinute: 10,
        dailyLimit: 100,
        retryDelay: 2000
    },
    
    // Görüntü kalite ayarları
    IMAGE_SETTINGS: {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.95,
        format: 'jpeg'
    }
};