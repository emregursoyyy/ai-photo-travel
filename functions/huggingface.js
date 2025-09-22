// Cloudflare Pages Function - Hugging Face API Proxy
// Bu fonksiyon environment değişkenlerini güvenli şekilde kullanır

export async function onRequest(context) {
    const { request, env } = context;
    
    try {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        
        // OPTIONS request için CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        // Environment değişkeninden token al
        const token = env.HUGGING_FACE_TOKEN;
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Hugging Face token not configured' }), 
                { 
                    status: 500, 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
            );
        }
        
        // Request body'den model adını ve image data'sını al
        const formData = await request.formData();
        const modelName = formData.get('model') || 'briaai/RMBG-2.0';
        const imageFile = formData.get('image');
        
        if (!imageFile) {
            return new Response(
                JSON.stringify({ error: 'No image file provided' }), 
                { 
                    status: 400, 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
            );
        }
        
        // Hugging Face API'ye istek gönder
        const huggingFaceUrl = `https://api-inference.huggingface.co/models/${modelName}`;
        
        const response = await fetch(huggingFaceUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/octet-stream'
            },
            body: imageFile
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error:', response.status, errorText);
            
            return new Response(
                JSON.stringify({ 
                    error: `Hugging Face API error: ${response.status}`,
                    details: errorText
                }), 
                { 
                    status: response.status, 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
            );
        }
        
        // Başarılı response'u client'a gönder
        const imageBlob = await response.blob();
        
        return new Response(imageBlob, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': response.headers.get('Content-Type') || 'image/png'
            }
        });
        
    } catch (error) {
        console.error('Pages Function Error:', error);
        
        return new Response(
            JSON.stringify({ 
                error: 'Internal server error',
                details: error.message
            }), 
            { 
                status: 500, 
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}