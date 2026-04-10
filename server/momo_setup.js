const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// المفتاح الذي حصلت عليه من الصورة
const SUBSCRIPTION_KEY = '7b404547b3c448bfbc8b46e00924ffda'; 

async function setupMomo() {
    try {
        const userId = uuidv4(); 
        console.log('1. Generating User ID (X-Reference-Id):', userId);

        // إنشاء الـ API User في بيئة الاختبار
        await axios.post('https://sandbox.momodeveloper.mtn.com/v1_0/apiuser', 
            { providerCallbackHost: "https://your-domain.com" }, 
            { headers: { 
                'X-Reference-Id': userId, 
                'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY 
            } }
        );

        // إنشاء الـ API Key لهذا المستخدم
        const res = await axios.post(`https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${userId}/apikey`, 
            {}, 
            { headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY } }
        );

        console.log('2. Your API KEY is:', res.data.apiKey);
        console.log('\n--- SAVE THESE TO YOUR .ENV FILE ---');
        console.log(`MOMO_API_USER_ID=${userId}`);
        console.log(`MOMO_API_KEY=${res.data.apiKey}`);
    } catch (error) {
        console.error('Error during setup:', error.response ? error.response.data : error.message);
    }
}

setupMomo();
