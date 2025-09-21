// functions/remove-background.js

// Helper function to fetch as a blob, with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

// Provider: PhotoRoom
async function removeBackgroundPhotoRoom(imageFile, apiKey) {
    if (!apiKey) throw new Error('PhotoRoom API key is not set.');
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetchWithTimeout('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
        timeout: 15000
    });

    if (!response.ok) {
        throw new Error(`PhotoRoom API error: ${response.status} ${await response.text()}`);
    }
    return response.blob();
}

// Provider: Remove.bg
async function removeBackgroundRemoveBG(imageFile, apiKey) {
    if (!apiKey) throw new Error('Remove.bg API key is not set.');
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');

    const response = await fetchWithTimeout('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
        timeout: 15000
    });

    if (!response.ok) {
        throw new Error(`Remove.bg API error: ${response.status} ${await response.text()}`);
    }
    return response.blob();
}

// Provider: Hugging Face
async function removeBackgroundHuggingFace(imageFile, apiKey) {
    if (!apiKey) throw new Error('Hugging Face API key is not set.');
    const apiUrl = 'https://api-inference.huggingface.co/models/briaai/RMBG-1.4';
    
    const response = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/octet-stream'
        },
        body: imageFile,
        timeout: 25000 // This model can be slow
    });

    if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status} ${await response.text()}`);
    }
    return response.blob();
}


// Main Serverless Function Handler
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const formData = await request.formData();
    const imageFile = formData.get('image_file');

    if (!imageFile) {
      return new Response('Image file not found in form data.', { status: 400 });
    }

    // Define providers and their corresponding functions and API keys from environment variables
    const providers = [
      { name: 'PhotoRoom', fn: removeBackgroundPhotoRoom, key: env.PHOTOROOM_TOKEN },
      { name: 'Remove.bg', fn: removeBackgroundRemoveBG, key: env.REMOVEBG_TOKEN },
      { name: 'Hugging Face', fn: removeBackgroundHuggingFace, key: env.HUGGING_FACE_TOKEN },
    ];

    // Try each provider in order
    for (const provider of providers) {
      if (provider.key && provider.key !== 'your_token_here') { // Check if key exists
        try {
          console.log(`Attempting background removal with ${provider.name}...`);
          const resultBlob = await provider.fn(imageFile, provider.key);
          console.log(`${provider.name} succeeded.`);
          // Return the successful result immediately
          return new Response(resultBlob, {
            status: 200,
            headers: { 'Content-Type': 'image/png' }
          });
        } catch (error) {
          console.error(`${provider.name} failed:`, error.message);
          // Log the error and try the next provider
        }
      } else {
          console.log(`Skipping ${provider.name} due to missing API key.`);
      }
    }

    // If all providers fail
    return new Response('All background removal services failed. Please try again later.', { status: 500 });

  } catch (error) {
    console.error('An unexpected error occurred in the serverless function:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}