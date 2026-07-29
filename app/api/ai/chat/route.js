import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { message, history = [], products = [] } = await req.json();

        const rawKey = process.env.GEMINI_API_KEY || '';
        // Strip surrounding quotes or whitespace if present in .env
        const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

        if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY") {
            return NextResponse.json({
                text: "⚠️ **LetsCart AI is ready for integration!**\n\nTo activate me, please add a valid Gemini API Key in your [`.env`](file:///d:/letscart/.env) file:\n```env\nGEMINI_API_KEY=\"AIzaSy...\"\n```\nAfter saving, try asking me a question again!",
                recommendedProductIds: []
            });
        }

        // Map frontend chat history to Gemini's expected role structure ('user' and 'model')
        const formattedHistory = [];
        for (const msg of history) {
            if (!msg.text || msg.id === 'msg-1') continue;
            formattedHistory.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }

        // Add the current user message to the history
        formattedHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Limit history to last 10 messages
        const contents = formattedHistory.slice(-10);

        // System instructions with product catalog context
        const systemInstruction = {
            parts: [{
                text: `You are the LetsCart AI Assistant, a friendly and expert virtual shopping assistant for the "LetsCart" e-commerce store. 
Your goal is to help users find products, give smart recommendations, and answer questions.

Here is the current active product catalog in LetsCart:
${JSON.stringify(products.map(p => ({ id: String(p.id), name: p.name, price: p.price, category: p.category, description: p.description })), null, 2)}

Instructions:
1. Actively browse the catalog above. Recommend specific items by matching their details with what the user is asking.
2. Only recommend products that are present in the list above. Do NOT invent new products.
3. If the user asks for budget-friendly/cheap options, sort and recommend the lowest-priced items from the catalog.
4. Keep your replies concise, friendly, and helpful. Always format text beautifully with markdown.
5. In your response JSON, you must return a conversational text reply AND a list of exact matching product ID strings from the catalog (maximum 3 IDs).`
            }]
        };

        const payload = {
            contents,
            systemInstruction,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        text: { 
                            type: "string", 
                            description: "The main conversational response to the user's query." 
                        },
                        recommendedProductIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "An array of exact ID strings of recommended products from the catalog. Max 3 items."
                        }
                    },
                    required: ["text", "recommendedProductIds"]
                }
            }
        };

        // 1. Dynamically query Google AI Studio for models supported by this API key
        let targetModels = [];
        try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listRes.ok) {
                const listData = await listRes.json();
                const available = (listData.models || [])
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
                
                // Prioritize flash models, then pro, then any other valid models
                const flash = available.filter(m => m.includes('flash'));
                const pro = available.filter(m => m.includes('pro'));
                const others = available.filter(m => !m.includes('flash') && !m.includes('pro'));
                
                targetModels = [...flash, ...pro, ...others];
            }
        } catch (e) {
            console.warn("Could not fetch ListModels dynamically:", e);
        }

        // Fallback default list if ListModels didn't return candidates
        if (targetModels.length === 0) {
            targetModels = [
                'gemini-1.5-flash',
                'gemini-2.0-flash-exp',
                'gemini-1.5-pro',
                'gemini-1.0-pro'
            ];
        }

        let response = null;
        let lastErrorText = '';

        for (const modelName of targetModels) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }
                );

                if (res.ok) {
                    response = res;
                    break;
                } else {
                    lastErrorText = await res.text();
                }
            } catch (err) {
                lastErrorText = err.message;
            }
        }

        if (!response) {
            throw new Error(`Gemini API request failed across models. Details: ${lastErrorText}`);
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
            throw new Error("No response text returned from Gemini candidate.");
        }

        // Parse structured output returned by Gemini
        const result = JSON.parse(candidateText.trim());
        return NextResponse.json(result);

    } catch (error) {
        console.error("AI Chat API Error:", error);
        return NextResponse.json(
            { 
                text: `⚠️ **AI Service Error**\n\n${error.message || 'Failed to communicate with AI API.'}`, 
                recommendedProductIds: [] 
            }, 
            { status: 500 }
        );
    }
}
