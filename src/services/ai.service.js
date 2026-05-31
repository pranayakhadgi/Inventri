const { LLMCommandSchema, SYSTEM_PROMPT } = require('../schemas/llm-command.schema.js');

class AIService {
    constructor() {
        this.provider = process.env.LLM_PROVIDER || 'local';
        this.localUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
        this.localModel = process.env.LOCAL_LLM_MODEL || 'llama3.1';
        this.groqKey = process.env.GROQ_API_KEY;
        this.groqModel = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
    }

    async parseCommand(userInput) {
        const raw = this.provider === 'local' ?
            await this.callLocal(userInput) : await this.callGroq(userInput);

        const parsed = this.safeParseJSON(raw);
        const validated = LLMCommandSchema.parse(parsed);

        if (validated.confidence < 0.7) {
            throw new Error(`Low confidence (${validated.confidence}). 
                    Rephrase or be more specific,`);
        }
        return validated;
    }

    async callLocal(userInput) {
        const res = await fetch(`${this.localUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.localModel,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Parse: "${userInput}"` }
                ],
                format: 'json',
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 256
                }
            })
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Local LLM error: ${res.status} ${res.statusText} — ${errBody}`);
        }

        const data = await res.json();
        return data.message.content;
    }

    async callGroq(userInput) {
        const res = await
            fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.groqModel,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `Parse: "${userInput}"` }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1
                })
            });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Groq error: ${res.status} — ${errBody}`);
        }

        const data = await res.json();
        return data.choices[0].message.content;
    }

    safeParseJSON(raw) {
        try {
            const cleaned = raw
                .replace(/```json\s?/gi, '')
                .replace(/```\s?/gi, '')
                .trim();
            return JSON.parse(cleaned);
        } catch (e) {
            throw new Error(`LLM returned invalid JSON: ${raw.substring(0, 200)}`);
        }
    }
}

module.exports = new AIService();