import { Router } from 'express';
import aiService from '../services/ai.services.js';

const router = Router();

router.post('/api/ai/command', async (req, res) => {
    const { command } = req.body;

    if (!command || typeof command != 'string') {
        return res.status(400).json({
            success: false,
            error: 'Command string required'
        });
    }

    try {
        const parsed = await aiService.parseCommand(command);

        //we'll wire executeIntent in the next section.
        return res.json({
            success: true,
            intent: parsed.intent,
            entities: parsed.entities,
            confidence: parsed.confidence,
            result: null //placeholder for DB execution result
        });
    } catch (err) {
        console.error('AI command failed:', err);
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

export default router;