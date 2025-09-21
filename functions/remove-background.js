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

// Provider: Replicate (RMBG 2.0, SAM2, BiRefNet)
async function removeBackgroundReplicate(imageFile, apiKey, model = 'rmbg-2.0') {
    if (!apiKey) throw new Error('Replicate API key is not set.');
    
    // Convert image to base64
    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });

    // Model version mapping
    const modelVersions = {
        'rmbg-2.0': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        'sam2': 'sam2-hiera-large',
        'birefnet': 'birefnet-hr-v1'
    };

    const version = modelVersions[model] || modelVersions['rmbg-2.0'];

    // Create prediction
    const createResponse = await fetchWithTimeout('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: version,
            input: {
                image: base64,
                model: model === 'rmbg-2.0' ? 'rmbg-2.0' : undefined,
                return_mask: false,
                high_resolution: model === 'birefnet',
                refine_edges: model === 'birefnet',
                point_coords: model === 'sam2' ? null : undefined,
                point_labels: model === 'sam2' ? null : undefined,
                box: model === 'sam2' ? null : undefined,
                multimask_output: model === 'sam2' ? true : undefined
            }
        }),
        timeout: 15000
    });

    if (!createResponse.ok) {
        throw new Error(`Replicate create error: ${createResponse.status} ${await createResponse.text()}`);
    }

    const prediction = await createResponse.json();

    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetchWithTimeout(result.urls.get, {
            headers: {
                'Authorization': `Token ${apiKey}`
            },
            timeout: 10000
        });

        if (!pollResponse.ok) {
            throw new Error(`Replicate poll error: ${pollResponse.status}`);
        }

        result = await pollResponse.json();
        attempts++;
    }

    if (result.status === 'failed') {
        throw new Error(`Replicate prediction failed: ${result.error}`);
    }

    if (result.status !== 'succeeded') {
        throw new Error('Replicate prediction timeout');
    }

    // Fetch the result image
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    const imageResponse = await fetchWithTimeout(imageUrl, { timeout: 15000 });
    
    if (!imageResponse.ok) {
        throw new Error(`Failed to fetch result image: ${imageResponse.status}`);
    }

    return imageResponse.blob();
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
    const provider = formData.get('provider');

    if (!imageFile) {
      return new Response('Image file not found in form data.', { status: 400 });
    }

    // Handle specific provider requests
    if (provider) {
      let resultBlob;
      switch (provider) {
        case 'replicate-rmbg2':
          if (!env.REPLICATE_API_TOKEN) {
            return new Response('Replicate API token not configured', { status: 500 });
          }
          resultBlob = await removeBackgroundReplicate(imageFile, env.REPLICATE_API_TOKEN, 'rmbg-2.0');
          break;
        case 'replicate-sam2':
          if (!env.REPLICATE_API_TOKEN) {
            return new Response('Replicate API token not configured', { status: 500 });
          }
          resultBlob = await removeBackgroundReplicate(imageFile, env.REPLICATE_API_TOKEN, 'sam2');
          break;
        case 'replicate-birefnet':
          if (!env.REPLICATE_API_TOKEN) {
            return new Response('Replicate API token not configured', { status: 500 });
          }
          resultBlob = await removeBackgroundReplicate(imageFile, env.REPLICATE_API_TOKEN, 'birefnet');
          break;
        default:
          return new Response('Unknown provider specified', { status: 400 });
      }
      
      return new Response(resultBlob, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    }

    // Define providers and their corresponding functions and API keys from environment variables
    const providers = [
      { name: 'Replicate RMBG 2.0', fn: (file, key) => removeBackgroundReplicate(file, key, 'rmbg-2.0'), key: env.REPLICATE_API_TOKEN },
      { name: 'Replicate SAM2', fn: (file, key) => removeBackgroundReplicate(file, key, 'sam2'), key: env.REPLICATE_API_TOKEN },
      { name: 'Replicate BiRefNet', fn: (file, key) => removeBackgroundReplicate(file, key, 'birefnet'), key: env.REPLICATE_API_TOKEN },
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