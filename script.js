// API Configuration
        const API_CONFIG = {
            // Hugging Face ücretsiz Inference API
            // Token config.js dosyasından alınır (deployment sırasında inject edilir)
            token: (window.APP_CONFIG && window.APP_CONFIG.HUGGING_FACE_TOKEN !== '{{HUGGING_FACE_TOKEN}}') 
                   ? window.APP_CONFIG.HUGGING_FACE_TOKEN 
                   : 'YOUR_HUGGING_FACE_TOKEN_HERE', // Fallback token
            backgroundRemovalModel: 'briaai/RMBG-1.4',
            stableDiffusionModel: 'runwayml/stable-diffusion-v1-5',
            baseUrl: 'https://api-inference.huggingface.co/models/',
            
            // Fallback için Pollinations (tamamen ücretsiz)
            pollinations: 'https://image.pollinations.ai/prompt/',
            
            maxRetries: 3,
            retryDelay: 2000,
            timeout: 30000,
            
            // Ücretsiz kullanım limitleri
            dailyLimit: 100, // Günlük 100 işlem
            rateLimitDelay: 1000 // İstekler arası 1 saniye bekleme
        };

        let selectedPhoto = null;
        let selectedCategory = null;
        let selectedLocation = null;
        let parameters = {
            time: 'morning',
            weather: 'sunny',
            crowd: 30,
            quality: 8
        };

        const locations = {
            cities: [
                {name: 'Paris', country: 'Fransa', emoji: '🇫🇷', description: 'Eyfel Kulesi manzarası'},
                {name: 'Tokyo', country: 'Japonya', emoji: '🇯🇵', description: 'Neon ışıkları'},
                {name: 'New York', country: 'ABD', emoji: '🇺🇸', description: 'Times Square'},
                {name: 'İstanbul', country: 'Türkiye', emoji: '🇹🇷', description: 'Boğaz manzarası'},
                {name: 'London', country: 'İngiltere', emoji: '🇬🇧', description: 'Big Ben'},
                {name: 'Dubai', country: 'BAE', emoji: '🇦🇪', description: 'Burj Khalifa'}
            ],
            hotels: [
                {name: 'Burj Al Arab', country: 'Dubai', emoji: '🏨', description: '7 yıldızlı lüks'},
                {name: 'Ritz Paris', country: 'Fransa', emoji: '🥂', description: 'Klasik elegans'},
                {name: 'Marina Bay Sands', country: 'Singapur', emoji: '🏊', description: 'Çatı havuzu'},
                {name: 'Four Seasons Bora Bora', country: 'Tahiti', emoji: '🏝️', description: 'Su üstü villa'},
                {name: 'Hotel Splendido', country: 'İtalya', emoji: '🍝', description: 'Portofino manzarası'},
                {name: 'Aman Tokyo', country: 'Japonya', emoji: '🏯', description: 'Zen mimarisi'}
            ],
            nature: [
                {name: 'Santorini', country: 'Yunanistan', emoji: '🌅', description: 'Beyaz evler, mavi deniz'},
                {name: 'Maldivler', country: 'Maldivler', emoji: '🏖️', description: 'Kristal berraklığında su'},
                {name: 'Bali', country: 'Endonezya', emoji: '🌺', description: 'Pirinç tarlaları'},
                {name: 'Cappadocia', country: 'Türkiye', emoji: '🎈', description: 'Balon turu'},
                {name: 'Machu Picchu', country: 'Peru', emoji: '⛰️', description: 'Antik şehir'},
                {name: 'Northern Lights', country: 'İzlanda', emoji: '🌌', description: 'Kuzey ışıkları'}
            ],
            landmarks: [
                {name: 'Eyfel Kulesi', country: 'Fransa', emoji: '🗼', description: 'Paris\'in simgesi'},
                {name: 'Statue of Liberty', country: 'ABD', emoji: '🗽', description: 'Özgürlük anıtı'},
                {name: 'Taj Mahal', country: 'Hindistan', emoji: '🕌', description: 'Aşk anıtı'},
                {name: 'Colosseum', country: 'İtalya', emoji: '🏛️', description: 'Roma gladyatörleri'},
                {name: 'Great Wall', country: 'Çin', emoji: '🏔️', description: 'Çin Seddi'},
                {name: 'Christ the Redeemer', country: 'Brezilya', emoji: '⛪', description: 'Rio manzarası'}
            ]
        };

        // Fotoğraf yükleme
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                selectedPhoto = file;
                showModal('categoryModal');
            }
        });

        function openCamera() {
            document.getElementById('fileInput').setAttribute('capture', 'user');
            document.getElementById('fileInput').click();
        }

        function showModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function selectCategory(category) {
            selectedCategory = category;
            
            // Kategori kartlarını güncelle
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('selected');
            });
            event.target.closest('.category-card').classList.add('selected');
            
            setTimeout(() => {
                closeModal('categoryModal');
                showLocationModal(category);
            }, 300);
        }

        function showLocationModal(category) {
            const modal = document.getElementById('locationModal');
            const title = document.getElementById('locationModalTitle');
            const grid = document.getElementById('locationGrid');
            
            title.textContent = getCategoryTitle(category);
            grid.innerHTML = '';
            
            locations[category].forEach(location => {
                const item = document.createElement('div');
                item.className = 'location-item';
                item.onclick = () => selectLocation(location, item);
                
                item.innerHTML = `
                    <div class="location-emoji">${location.emoji}</div>
                    <div class="location-details">
                        <h4>${location.name}</h4>
                        <p>${location.country} • ${location.description}</p>
                    </div>
                `;
                
                grid.appendChild(item);
            });
            
            showModal('locationModal');
        }

        function getCategoryTitle(category) {
            const titles = {
                cities: '🏙️ Şehir Seç',
                hotels: '🏨 Otel Seç', 
                nature: '🌿 Doğa Seç',
                landmarks: '🗿 Simge Seç'
            };
            return titles[category];
        }

        function selectLocation(location, element) {
            selectedLocation = location;
            
            document.querySelectorAll('.location-item').forEach(item => {
                item.classList.remove('selected');
            });
            element.classList.add('selected');
        }

        function showParametersModal() {
            if (!selectedLocation) {
                alert('Lütfen bir lokasyon seçin!');
                return;
            }
            
            closeModal('locationModal');
            showModal('parametersModal');
        }

        // Parametre seçimleri
        document.querySelectorAll('.time-option').forEach(option => {
            option.addEventListener('click', function() {
                if (this.dataset.time) {
                    document.querySelectorAll('[data-time]').forEach(el => el.classList.remove('selected'));
                    this.classList.add('selected');
                    parameters.time = this.dataset.time;
                }
                if (this.dataset.weather) {
                    document.querySelectorAll('[data-weather]').forEach(el => el.classList.remove('selected'));
                    this.classList.add('selected');
                    parameters.weather = this.dataset.weather;
                }
            });
        });

        document.getElementById('crowdSlider').addEventListener('input', function() {
            parameters.crowd = this.value;
        });

        document.getElementById('qualitySlider').addEventListener('input', function() {
            parameters.quality = this.value;
        });

        async function generatePhoto() {
            if (!selectedPhoto || !selectedLocation) {
                showError('Eksik Bilgi', 'Lütfen fotoğraf ve lokasyon seçin!');
                return;
            }

            closeModal('parametersModal');
            document.getElementById('uploadSection').style.display = 'none';
            hideError();
            
            // Set retry operation
            lastOperation = generatePhoto;
            
            try {
                // Step 1: Prepare image (20%)
                showLoading('🖼️ Fotoğraf Hazırlanıyor', 'Görüntü boyutlandırılıyor...');
                updateProgress(10);
                
                const resizedImage = await resizeImage(selectedPhoto, 512, 512);
                updateProgress(20);
                
                // Step 2: Remove background (40%)
                updateLoadingTitle('✂️ Arka Plan Kaldırılıyor');
                updateLoadingMessage('AI ile arka plan temizleniyor...');
                updateProgress(25);
                
                const backgroundRemovedImage = await removeBackgroundWithRetry(resizedImage);
                updateProgress(40);
                
                // Step 3: Generate new background (70%)
                updateLoadingTitle('🎨 Yeni Arka Plan Oluşturuluyor');
                updateLoadingMessage(`${selectedLocation.name} için sahne hazırlanıyor...`);
                updateProgress(45);
                
                const prompt = createPrompt();
                const newBackground = await generateBackgroundWithRetry(prompt);
                updateProgress(70);
                
                // Step 4: Combine images (90%)
                updateLoadingTitle('🔄 Görüntüler Birleştiriliyor');
                updateLoadingMessage('Son dokunuşlar yapılıyor...');
                updateProgress(75);
                
                const finalImage = await combineImagesAdvanced(backgroundRemovedImage, newBackground);
                updateProgress(90);
                
                // Step 5: Finalize (100%)
                updateLoadingMessage('Tamamlanıyor...');
                updateProgress(100);
                
                setTimeout(() => {
                    hideLoading();
                    document.getElementById('previewSection').style.display = 'block';
                    document.getElementById('previewImage').src = finalImage;
                    document.getElementById('shareBtn').style.display = 'inline-block';
                }, 500);
                
            } catch (error) {
                console.error('AI işleme hatası:', error);
                
                // Determine error type and show appropriate message
                let errorTitle = 'İşlem Hatası';
                let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
                
                if (error.message && error.message.includes('network')) {
                    errorTitle = 'Bağlantı Hatası';
                    errorMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
                } else if (error.message && error.message.includes('API')) {
                    errorTitle = 'Servis Hatası';
                    errorMessage = 'AI servisi şu anda kullanılamıyor. Demo sonuç gösterilecek.';
                    
                    // Show demo result after a delay
                    setTimeout(() => {
                        hideError();
                        showDemoResult();
                    }, 2000);
                    
                    showError(errorTitle, errorMessage, () => showDemoResult());
                    return;
                }
                
                showError(errorTitle, errorMessage, generatePhoto);
            }
        }

        // Enhanced Loading and Error Handling Functions
        let lastOperation = null;
        let currentProgress = 0;

        function updateLoadingMessage(message) {
            const messageElement = document.getElementById('loadingMessage');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        function updateLoadingTitle(title) {
            const titleElement = document.getElementById('loadingTitle');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }

        function updateProgress(percentage) {
            currentProgress = Math.min(100, Math.max(0, percentage));
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = currentProgress + '%';
            }
        }

        function showLoading(title = 'Fotoğrafın AI ile işleniyor...', message = 'Bu birkaç saniye sürebilir') {
            updateLoadingTitle(title);
            updateLoadingMessage(message);
            updateProgress(0);
            document.getElementById('loadingSection').style.display = 'block';
            document.getElementById('errorContainer').style.display = 'none';
        }

        function hideLoading() {
            document.getElementById('loadingSection').style.display = 'none';
        }

        function showError(title, message, operation = null) {
            lastOperation = operation;
            document.getElementById('errorTitle').textContent = title;
            document.getElementById('errorMessage').textContent = message;
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('errorContainer').style.display = 'block';
        }

        function hideError() {
            document.getElementById('errorContainer').style.display = 'none';
        }

        function retryLastOperation() {
            hideError();
            if (lastOperation && typeof lastOperation === 'function') {
                lastOperation();
            } else {
                // Default retry: restart the photo generation process
                if (selectedPhoto && selectedLocation) {
                    generatePhoto();
                } else {
                    resetApp();
                }
            }
        }

        async function resizeImage(file, maxWidth, maxHeight) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions maintaining aspect ratio
                    let { width, height } = img;
                    const aspectRatio = width / height;
                    
                    if (width > height) {
                        width = Math.min(width, maxWidth);
                        height = width / aspectRatio;
                    } else {
                        height = Math.min(height, maxHeight);
                        width = height * aspectRatio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(resolve, 'image/jpeg', 0.9);
                };
                
                img.src = URL.createObjectURL(file);
            });
        }

        async function removeBackgroundWithRetry(imageFile, maxRetries = 3) {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const result = await removeBackground(imageFile);
                    return result;
                } catch (error) {
                    console.log(`Background removal attempt ${i + 1} failed:`, error);
                    if (i === maxRetries - 1) {
                        throw error;
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }

        async function generateBackgroundWithRetry(prompt, maxRetries = 3) {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const result = await generateBackground(prompt);
                    return result;
                } catch (error) {
                    console.log(`Background generation attempt ${i + 1} failed:`, error);
                    if (i === maxRetries - 1) {
                        throw error;
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                }
            }
        }

        function createPrompt() {
            const timeDescriptions = {
                'morning': 'golden hour sunrise, soft warm lighting, early morning atmosphere, gentle shadows',
                'noon': 'bright daylight, clear blue sky, vivid colors, sharp details, midday sun',
                'sunset': 'golden sunset, orange and purple sky, dramatic lighting, warm tones, magic hour',
                'night': 'night scene, ambient city lighting, neon lights, atmospheric glow, evening mood'
            };
            
            const weatherDescriptions = {
                'sunny': 'clear sunny day, bright blue sky, excellent visibility, vibrant colors',
                'cloudy': 'partly cloudy, dramatic cloud formations, diffused lighting, moody atmosphere',
                'rainy': 'light rain, wet reflective surfaces, atmospheric moisture, cinematic mood',
                'snowy': 'snow falling, winter wonderland, pristine white, cozy atmosphere'
            };
            
            const crowdDescriptions = {
                high: 'bustling with people, lively crowd, urban energy, busy atmosphere',
                medium: 'moderate crowd, some people walking around, casual activity',
                low: 'peaceful and quiet, few people, serene atmosphere, tranquil setting'
            };
            
            const crowdLevel = parameters.crowd > 70 ? crowdDescriptions.high : 
                             parameters.crowd > 30 ? crowdDescriptions.medium : crowdDescriptions.low;
            
            // Quality-based enhancements
            const qualityEnhancements = parameters.quality >= 8 ? 
                ', ultra high definition, masterpiece, award winning photography, professional composition' :
                parameters.quality >= 6 ? 
                ', high definition, professional quality, well composed' :
                ', good quality, clear details';
            
            // Location-specific enhancements
            const locationEnhancements = {
                'Paris': 'iconic Parisian architecture, romantic atmosphere',
                'Tokyo': 'modern Japanese cityscape, neon signs, urban technology',
                'New York': 'iconic NYC skyline, urban energy, metropolitan vibe',
                'İstanbul': 'historic Ottoman architecture, Bosphorus view, cultural richness',
                'London': 'classic British architecture, historic landmarks',
                'Dubai': 'futuristic architecture, luxury atmosphere, modern skyline'
            };
            
            const locationDetail = locationEnhancements[selectedLocation.name] || 'beautiful scenic location';
            
            return `${selectedLocation.description}, ${selectedLocation.name}, ${locationDetail}, ${timeDescriptions[parameters.time]}, ${weatherDescriptions[parameters.weather]}, ${crowdLevel}, professional photography, realistic, detailed${qualityEnhancements}`;
        }

        async function removeBackgroundWithRetry(imageFile, maxRetries = 3) {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const result = await removeBackground(imageFile);
                    return result;
                } catch (error) {
                    console.log(`Background removal attempt ${i + 1} failed:`, error);
                    if (i === maxRetries - 1) {
                        throw error;
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                }
            }
        }

        async function removeBackground(imageFile) {
            const API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.backgroundRemovalModel}`;
            
            for (let attempt = 1; attempt <= API_CONFIG.maxRetries; attempt++) {
                try {
                    updateLoadingMessage(`Arka plan kaldırılıyor... (Deneme ${attempt}/${API_CONFIG.maxRetries})`);
                    
                    // Rate limiting - istekler arası bekleme
                    if (attempt > 1) {
                        await new Promise(resolve => setTimeout(resolve, API_CONFIG.rateLimitDelay));
                    }
                    
                    // Convert file to blob if needed
                    const imageBlob = imageFile instanceof File ? imageFile : await fetch(imageFile).then(r => r.blob());
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
                    
                    const response = await fetch(API_URL, {
                        headers: {
                            "Authorization": `Bearer ${API_CONFIG.token}`,
                            "Content-Type": "application/octet-stream",
                        },
                        method: "POST",
                        body: imageBlob,
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        if (response.status === 503 && attempt < API_CONFIG.maxRetries) {
                            updateLoadingMessage(`Model yükleniyor, ${API_CONFIG.retryDelay/1000} saniye bekleniyor...`);
                            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
                            continue;
                        }
                        if (response.status === 429) {
                            updateLoadingMessage('Rate limit aşıldı, daha uzun bekleniyor...');
                            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * 2));
                            continue;
                        }
                        throw new Error(`Background removal failed: ${response.status} - ${errorText}`);
                    }
                    
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                } catch (error) {
                    console.error(`Background removal attempt ${attempt} failed:`, error);
                    
                    if (attempt === API_CONFIG.maxRetries) {
                        updateLoadingMessage('Hugging Face API başarısız, yerel işleme deneniyor...');
                        return await processImageLocally(imageFile);
                    }
                    
                    if (error.name === 'AbortError') {
                        updateLoadingMessage('İstek zaman aşımına uğradı, tekrar deneniyor...');
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
                }
            }
        }
        
        // Yerel işleme fallback fonksiyonu
        async function processImageLocally(imageFile) {
            try {
                updateLoadingMessage('Yerel arka plan kaldırma işlemi...');
                
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        // Orijinal görüntüyü çiz
                        ctx.drawImage(img, 0, 0);
                        
                        // Basit arka plan kaldırma algoritması
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        
                        // Kenar piksellerin ortalama rengini al (arka plan rengi olarak)
                        const bgColor = getBackgroundColor(data, canvas.width, canvas.height);
                        
                        // Arka plan rengine yakın pikselleri şeffaf yap
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            
                            // Renk benzerliği kontrolü
                            const colorDiff = Math.sqrt(
                                Math.pow(r - bgColor.r, 2) +
                                Math.pow(g - bgColor.g, 2) +
                                Math.pow(b - bgColor.b, 2)
                            );
                            
                            // Eşik değerinden küçükse şeffaf yap
                            if (colorDiff < 50) {
                                data[i + 3] = 0; // Alpha = 0 (şeffaf)
                            }
                        }
                        
                        ctx.putImageData(imageData, 0, 0);
                        
                        canvas.toBlob((blob) => {
                            resolve(URL.createObjectURL(blob));
                        }, 'image/png');
                    };
                    
                    img.onerror = () => reject(new Error('Görüntü yüklenemedi'));
                    
                    if (imageFile instanceof File) {
                        const reader = new FileReader();
                        reader.onload = (e) => img.src = e.target.result;
                        reader.readAsDataURL(imageFile);
                    } else {
                        img.src = imageFile;
                    }
                });
            } catch (error) {
                console.error('Local processing failed:', error);
                return imageFile; // Orijinal görüntüyü döndür
            }
        }
        
        // Arka plan rengi tespit etme yardımcı fonksiyonu
        function getBackgroundColor(data, width, height) {
            let r = 0, g = 0, b = 0, count = 0;
            
            // Kenar pikselleri kontrol et
            const edgePixels = [];
            
            // Üst ve alt kenar
            for (let x = 0; x < width; x++) {
                edgePixels.push((0 * width + x) * 4); // Üst kenar
                edgePixels.push(((height - 1) * width + x) * 4); // Alt kenar
            }
            
            // Sol ve sağ kenar
            for (let y = 0; y < height; y++) {
                edgePixels.push((y * width + 0) * 4); // Sol kenar
                edgePixels.push((y * width + (width - 1)) * 4); // Sağ kenar
            }
            
            // Kenar piksellerin ortalama rengini hesapla
            edgePixels.forEach(i => {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            });
            
            return {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count)
            };
        }

        async function generateBackground(prompt) {
            const API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.imageGenerationModel}`;
            
            for (let attempt = 1; attempt <= API_CONFIG.maxRetries; attempt++) {
                try {
                    updateLoadingMessage(`Arka plan oluşturuluyor... (Deneme ${attempt}/${API_CONFIG.maxRetries})`);
                    
                    // Rate limiting - istekler arası bekleme
                    if (attempt > 1) {
                        await new Promise(resolve => setTimeout(resolve, API_CONFIG.rateLimitDelay));
                    }
                    
                    // Enhanced prompt with quality and style improvements
                    const enhancedPrompt = `${prompt}, high quality, detailed, professional photography, 8k resolution, cinematic lighting, masterpiece`;
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
                    
                    const response = await fetch(API_URL, {
                        headers: {
                            "Authorization": `Bearer ${API_CONFIG.token}`,
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify({
                            "inputs": enhancedPrompt,
                            "parameters": {
                                "num_inference_steps": 20,
                                "guidance_scale": 7.5,
                                "width": 768,
                                "height": 768
                            }
                        }),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        if (response.status === 503 && attempt < API_CONFIG.maxRetries) {
                            updateLoadingMessage(`Model yükleniyor, ${API_CONFIG.retryDelay/1000} saniye bekleniyor...`);
                            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
                            continue;
                        }
                        if (response.status === 429) {
                            updateLoadingMessage('Rate limit aşıldı, daha uzun bekleniyor...');
                            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * 2));
                            continue;
                        }
                        throw new Error(`Background generation failed: ${response.status} - ${errorText}`);
                    }
                    
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                } catch (error) {
                    console.error(`Background generation attempt ${attempt} failed:`, error);
                    
                    if (attempt === API_CONFIG.maxRetries) {
                        updateLoadingMessage('Hugging Face API başarısız, yerel arka plan oluşturuluyor...');
                        return generateFallbackBackground(prompt);
                    }
                    
                    if (error.name === 'AbortError') {
                        updateLoadingMessage('İstek zaman aşımına uğradı, tekrar deneniyor...');
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
                }
            }
        }
        
        // Fallback arka plan oluşturma fonksiyonu
        function generateFallbackBackground(prompt) {
            return new Promise((resolve) => {
                updateLoadingMessage('Yerel arka plan oluşturuluyor...');
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 768;
                canvas.height = 768;
                
                // Prompt'a göre renk paleti seç
                const colorPalettes = {
                    'beach': ['#87CEEB', '#F0E68C', '#DEB887'],
                    'mountain': ['#4682B4', '#2F4F4F', '#696969'],
                    'city': ['#2F2F2F', '#4169E1', '#FF6347'],
                    'forest': ['#228B22', '#006400', '#8FBC8F'],
                    'sunset': ['#FF6347', '#FF4500', '#FFD700'],
                    'default': ['#87CEEB', '#98FB98', '#DDA0DD']
                };
                
                let colors = colorPalettes.default;
                for (const [key, palette] of Object.entries(colorPalettes)) {
                    if (prompt.toLowerCase().includes(key)) {
                        colors = palette;
                        break;
                    }
                }
                
                // Gradyan arka plan oluştur
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(0.5, colors[1]);
                gradient.addColorStop(1, colors[2]);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Basit doku efekti ekle
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < 100; i++) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
                    ctx.fillRect(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        Math.random() * 20,
                        Math.random() * 20
                    );
                }
                
                canvas.toBlob((blob) => {
                    resolve(URL.createObjectURL(blob));
                }, 'image/png');
            });
        }

        async function combineImagesAdvanced(foreground, background) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1024;
                canvas.height = 1024;
                
                const bgImg = new Image();
                const fgImg = new Image();
                
                let loadedImages = 0;
                
                const onImageLoad = () => {
                    loadedImages++;
                    if (loadedImages === 2) {
                        // Clear canvas with background color
                        ctx.fillStyle = '#f0f0f0';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw background image (fill entire canvas)
                        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                        
                        // Calculate person positioning for realistic travel photo effect
                        const fgAspectRatio = fgImg.width / fgImg.height;
                        let personWidth, personHeight;
                        
                        // Scale person to fit naturally in the travel scene
                        if (fgAspectRatio > 1) {
                            // Landscape person image
                            personWidth = canvas.width * 0.4; // Smaller for more realistic scale
                            personHeight = personWidth / fgAspectRatio;
                        } else {
                            // Portrait person image - typical selfie
                            personHeight = canvas.height * 0.6; // More realistic travel photo scale
                            personWidth = personHeight * fgAspectRatio;
                        }
                        
                        // Position person more naturally (slightly off-center, rule of thirds)
                        const x = canvas.width * 0.3; // Off-center positioning
                        const y = canvas.height - personHeight - (canvas.height * 0.1);
                        
                        // Apply realistic shadow based on lighting conditions
                        const shadowIntensity = parameters.time === 'noon' ? 0.4 : 
                                              parameters.time === 'morning' ? 0.2 :
                                              parameters.time === 'sunset' ? 0.3 : 0.1;
                        
                        ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
                        ctx.shadowBlur = 15;
                        ctx.shadowOffsetX = parameters.time === 'sunset' ? -8 : 3;
                        ctx.shadowOffsetY = 8;
                        
                        // Apply perspective correction for travel photo realism
                        ctx.save();
                        
                        // Slight perspective transform for depth
                        const perspectiveStrength = 0.02;
                        ctx.transform(
                            1, perspectiveStrength, // Slight skew for perspective
                            0, 1,
                            0, 0
                        );
                        
                        // Draw person with enhanced realism
                        ctx.drawImage(fgImg, x, y, personWidth, personHeight);
                        
                        ctx.restore();
                        
                        // Reset shadow
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        
                        // Add atmospheric effects based on location and weather
                        if (parameters.weather === 'sunset') {
                            // Warm sunset glow
                            const sunsetGradient = ctx.createRadialGradient(
                                canvas.width * 0.8, canvas.height * 0.2, 0,
                                canvas.width * 0.8, canvas.height * 0.2, canvas.width * 0.6
                            );
                            sunsetGradient.addColorStop(0, 'rgba(255, 165, 0, 0.15)');
                            sunsetGradient.addColorStop(1, 'rgba(255, 69, 0, 0.05)');
                            
                            ctx.fillStyle = sunsetGradient;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        
                        if (parameters.weather === 'cloudy') {
                            // Soft diffused lighting
                            ctx.fillStyle = 'rgba(200, 200, 220, 0.1)';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        
                        // Add subtle vignette for professional photo look
                        const vignetteGradient = ctx.createRadialGradient(
                            canvas.width / 2, canvas.height / 2, 0,
                            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
                        );
                        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                        vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
                        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
                        
                        ctx.fillStyle = vignetteGradient;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Add color grading for travel photo aesthetic
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        
                        // Apply subtle color grading based on time and weather
                        for (let i = 0; i < data.length; i += 4) {
                            if (parameters.time === 'sunset') {
                                // Warm sunset tones
                                data[i] = Math.min(255, data[i] * 1.1);     // Red boost
                                data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green slight boost
                                data[i + 2] = Math.min(255, data[i + 2] * 0.95);  // Blue reduction
                            } else if (parameters.time === 'morning') {
                                // Cool morning tones
                                data[i] = Math.min(255, data[i] * 1.02);     // Red slight boost
                                data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green boost
                                data[i + 2] = Math.min(255, data[i + 2] * 1.08);  // Blue boost
                            }
                        }
                        
                        ctx.putImageData(imageData, 0, 0);
                        
                        resolve(canvas.toDataURL('image/jpeg', 0.95));
                    }
                };
                
                bgImg.onload = onImageLoad;
                fgImg.onload = onImageLoad;
                
                bgImg.src = background;
                fgImg.src = foreground;
            });
        }

        async function processImageLocally(imageFile) {
            // Yerel görüntü işleme (API yoksa fallback)
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL());
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(imageFile);
            });
        }

        function generateLocalBackground() {
            // Yerel arka plan oluşturucu (API yoksa fallback)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 512;
            
            // Lokasyona göre gradient renkleri
            const colors = {
                'Paris': ['#FF6B9D', '#C44569'],
                'Tokyo': ['#FF6B35', '#FF8E53'],
                'New York': ['#4ECDC4', '#44A08D'],
                'İstanbul': ['#667EEA', '#764BA2'],
                'London': ['#A8A8A8', '#5D5D5D'],
                'Dubai': ['#FFD700', '#FFA500']
            };
            
            const locationColors = colors[selectedLocation.name] || ['#667EEA', '#764BA2'];
            
            const gradient = ctx.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, locationColors[0]);
            gradient.addColorStop(1, locationColors[1]);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
            
            // Lokasyon simgesi
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedLocation.emoji, 256, 300);
            
            return canvas.toDataURL();
        }

        function showDemoResult() {
            // Demo sonuç gösterimi
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('previewSection').style.display = 'block';
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 400;
            
            // Lokasyona göre arka plan
            const gradient = ctx.createLinearGradient(0, 0, 400, 400);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, '#4ecdc4');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 400);
            
            // Lokasyon bilgisi
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedLocation.emoji, 200, 150);
            ctx.fillText(selectedLocation.name, 200, 200);
            ctx.font = '16px Arial';
            ctx.fillText('AI ile düzenlenmiş fotoğraf', 200, 240);
            ctx.fillText(`${parameters.time} • ${parameters.weather}`, 200, 260);
            
            document.getElementById('previewImage').src = canvas.toDataURL();
            document.getElementById('shareBtn').style.display = 'inline-block';
        }

        function downloadImage() {
            const link = document.createElement('a');
            link.download = `ai-photo-${selectedLocation.name.toLowerCase()}.jpg`;
            link.href = document.getElementById('previewImage').src;
            link.click();
        }

        function resetApp() {
            selectedPhoto = null;
            selectedCategory = null;
            selectedLocation = null;
            parameters = {
                time: 'morning',
                weather: 'sunny',
                crowd: 30,
                quality: 8
            };
            
            document.getElementById('previewSection').style.display = 'none';
            document.getElementById('uploadSection').style.display = 'block';
            document.getElementById('fileInput').value = '';
            document.getElementById('shareBtn').style.display = 'none';
        }

        // Social Sharing Function
        async function shareImage() {
            const previewImage = document.getElementById('previewImage');
            
            if (!previewImage.src) {
                alert('Paylaşılacak fotoğraf bulunamadı!');
                return;
            }

            try {
                // Web Share API desteği kontrolü
                if (navigator.share && navigator.canShare) {
                    // Canvas'tan blob oluştur
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    img.onload = async function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        canvas.toBlob(async (blob) => {
                            const file = new File([blob], 'ai-travel-photo.jpg', { type: 'image/jpeg' });
                            
                            const shareData = {
                                title: 'AI Photo Travel ile Oluşturuldu',
                                text: 'Hayal ettiğim yerde çekilmiş fotoğrafım! 🌍✈️ #AIPhotoTravel',
                                files: [file]
                            };

                            if (navigator.canShare(shareData)) {
                                try {
                                    await navigator.share(shareData);
                                    console.log('Fotoğraf başarıyla paylaşıldı');
                                } catch (err) {
                                    console.log('Paylaşım iptal edildi:', err);
                                    fallbackShare();
                                }
                            } else {
                                fallbackShare();
                            }
                        }, 'image/jpeg', 0.9);
                    };
                    
                    img.src = previewImage.src;
                } else {
                    fallbackShare();
                }
            } catch (error) {
                console.error('Paylaşım hatası:', error);
                fallbackShare();
            }
        }

        function fallbackShare() {
            // Fallback: Kopyalama ve sosyal medya linkleri
            const shareText = 'AI Photo Travel ile hayal ettiğim yerde çekilmiş fotoğrafım! 🌍✈️';
            const shareUrl = window.location.href;
            
            // Clipboard API ile metni kopyala
            if (navigator.clipboard) {
                navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
                    showShareOptions();
                });
            } else {
                showShareOptions();
            }
        }

        function showShareOptions() {
            const shareModal = document.createElement('div');
            shareModal.className = 'modal';
            shareModal.style.display = 'block';
            shareModal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                    <div class="modal-header">
                        <div class="modal-title">📤 Fotoğrafını Paylaş</div>
                        <div class="modal-subtitle">Sosyal medyada arkadaşlarınla paylaş</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                        <button onclick="shareToWhatsApp()" style="background: #25D366; color: white; border: none; padding: 15px; border-radius: 10px; font-size: 14px;">
                            📱 WhatsApp
                        </button>
                        <button onclick="shareToTwitter()" style="background: #1DA1F2; color: white; border: none; padding: 15px; border-radius: 10px; font-size: 14px;">
                            🐦 Twitter
                        </button>
                        <button onclick="shareToFacebook()" style="background: #4267B2; color: white; border: none; padding: 15px; border-radius: 10px; font-size: 14px;">
                            📘 Facebook
                        </button>
                        <button onclick="shareToInstagram()" style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; border: none; padding: 15px; border-radius: 10px; font-size: 14px;">
                            📷 Instagram
                        </button>
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; font-size: 12px; text-align: center;">
                        💡 İpucu: Fotoğrafı önce indirin, sonra sosyal medyada paylaşın
                    </div>
                </div>
            `;
            document.body.appendChild(shareModal);
        }

        function shareToWhatsApp() {
            const text = encodeURIComponent('AI Photo Travel ile hayal ettiğim yerde çekilmiş fotoğrafım! 🌍✈️');
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }

        function shareToTwitter() {
            const text = encodeURIComponent('AI Photo Travel ile hayal ettiğim yerde çekilmiş fotoğrafım! 🌍✈️ #AIPhotoTravel #Travel #AI');
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        }

        function shareToFacebook() {
            const url = encodeURIComponent(window.location.href);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        }

        function shareToInstagram() {
            alert('Instagram\'da paylaşmak için:\n1. Fotoğrafı indirin\n2. Instagram uygulamasını açın\n3. Yeni gönderi oluşturun\n4. İndirdiğiniz fotoğrafı seçin');
        }

        // Modal dışına tıklayınca kapatma
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // PWA Install Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button or banner
            const installBanner = document.createElement('div');
            installBanner.innerHTML = `
                <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 15px; z-index: 9999; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px;">📱 Bu uygulamayı ana ekranınıza ekleyin!</p>
                    <button onclick="installApp()" style="background: #4facfe; color: white; border: none; padding: 10px 20px; border-radius: 20px; margin-right: 10px;">Yükle</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 20px;">Daha Sonra</button>
                </div>
            `;
            document.body.appendChild(installBanner);
        });

        function installApp() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            }
        }

        // Service Worker Registration with Update Handling
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('./sw.js', {
                        scope: './'
                    });
                    
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                    
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                    
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            });
        }

        // Show update notification
        function showUpdateNotification() {
            const updateBanner = document.createElement('div');
            updateBanner.innerHTML = `
                <div style="position: fixed; top: 20px; left: 20px; right: 20px; background: #4facfe; color: white; padding: 15px; border-radius: 15px; z-index: 10000; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <p style="margin: 0 0 10px 0; font-size: 14px;">🔄 Yeni bir güncelleme mevcut!</p>
                    <button onclick="reloadApp()" style="background: white; color: #4facfe; border: none; padding: 8px 16px; border-radius: 20px; margin-right: 10px; font-weight: bold;">Güncelle</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 20px;">Daha Sonra</button>
                </div>
            `;
            document.body.appendChild(updateBanner);
        }

        // Reload app with new service worker
        function reloadApp() {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        }

        // Network status monitoring
        function updateNetworkStatus() {
            const isOnline = navigator.onLine;
            const statusIndicator = document.getElementById('network-status');
            
            if (!statusIndicator) {
                const indicator = document.createElement('div');
                indicator.id = 'network-status';
                indicator.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    z-index: 9998;
                    transition: all 0.3s ease;
                `;
                document.body.appendChild(indicator);
            }
            
            const indicator = document.getElementById('network-status');
            if (isOnline) {
                indicator.style.background = '#4caf50';
                indicator.style.color = 'white';
                indicator.textContent = '🟢 Çevrimiçi';
                indicator.style.opacity = '0';
                setTimeout(() => indicator.style.opacity = '0', 2000);
            } else {
                indicator.style.background = '#f44336';
                indicator.style.color = 'white';
                indicator.textContent = '🔴 Çevrimdışı';
                indicator.style.opacity = '1';
            }
        }