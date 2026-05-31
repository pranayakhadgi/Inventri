const { z } = require('zod');

const LLMCommandSchema = z.object({
    intent: z.enum([
        'SWAP_RESERVATION',
        'CREATE_RESERVATION',
        'CHECK_AVAILABILITY',
        'CANCEL_RESERVATION',
        'UPDATE_ITEM_STATUS',
        'UNKNOWN'
    ]),
    entities: z.object({
        itemName: z.string().nullable(),
        fromOrganization: z.string().nullable(),
        toOrganization: z.string().nullable(),
        dateReference: z.string().nullable(),
        reservationId: z.number().nullable(),
        itemId: z.number().nullable()
    }),
    confidence: z.number().min(0).max(1)
});

const SYSTEM_PROMPT = `You extract structured data
from inventory management commands. Respond ONLY with valid JSON. 
No explanations, no markdown.

Schema: 
{
    "intent":
"SWAP_RESERVATION|CREATE_RESERVATION|CHECK_AVAILABILITY|CANCEL_RESERVATION|UPDATE_ITEM_STATUS|UNKNOWN",
"entities": {
    "itemName": string or null,
    "fromOrganization": string or null,
    "toOrganization": string or null,
    "dateReference": string or null,
    "reservationId": number or null,
    "itemId": number or null
    },
    "confidence": number 0-1
    }
    
Rules:
- "Swap X from Y to Z [date]" → SWAP_RESERVATION
- "Book/Reserve X for Y on [date]" → CREATE_RESERVATION
- "Is X available [date]?" → CHECK_AVAILABILITY
- "Cancel Y's reservation for X" → CANCEL_RESERVATION
- "Mark X as broken/missing" → UPDATE_ITEM_STATUS
- If uncertain: intent "UNKNOWN", confidence < 0.7
- Dates stay as natural language strings (e.g., "next Friday", "tomorrow 3pm")
- Do not guess IDs. If not mentioned, use null.

Examples:
Input: "Swap the SM58 mic from Namaste Nepal to SASU next Friday"
Output: {"intent":"SWAP_RESERVATION","entities":{"itemName":"SM58 mic","fromOrganization":"Namaste Nepal","toOrganization":"SASU","dateReference":"next Friday","reservationId":null,"itemId":null},"confidence":0.95}

Input: "Is the projector available tomorrow?"
Output: {"intent":"CHECK_AVAILABILITY","entities":{"itemName":"projector","fromOrganization":null,"toOrganization":null,"dateReference":"tomorrow","reservationId":null,"itemId":null},"confidence":0.92}`;

module.exports = {
    LLMCommandSchema,
    SYSTEM_PROMPT
};