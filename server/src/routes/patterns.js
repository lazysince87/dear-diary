const express = require('express');
const router = express.Router();

/**
 * Hardcoded pattern library for MVP
 * In production, this would come from MongoDB
 */
const PATTERNS = [
    {
        id: 'gaslighting',
        name: 'Gaslighting',
        // icon: '',
        severity: 'high',
        description: 'Making someone question their own reality, memory, or perception. This is one of the most damaging forms of emotional manipulation.',
        signs: [
            '"That never happened"',
            '"You\'re imagining things"',
            '"You\'re too sensitive"',
            '"I never said that"',
            'Denying events you clearly remember',
        ],
        examples: [
            '"You\'re crazy, I never did that."',
            '"Everyone agrees with me, you\'re the problem."',
            '"You\'re overreacting as usual."',
        ],
        healthyAlternative: 'In healthy relationships, both people\'s experiences and memories are respected, even during disagreements.',
    },
    {
        id: 'love-bombing',
        name: 'Love Bombing',
        // icon: '',
        severity: 'medium',
        description: 'Overwhelming someone with excessive affection, gifts, or attention early on to gain control and create emotional dependency.',
        signs: [
            'Intense affection very early in a relationship',
            'Excessive gifts or grand gestures',
            '"I\'ve never felt this way before" (very soon)',
            'Wanting to spend every moment together',
            'Pressuring quick commitment',
        ],
        examples: [
            '"You\'re my soulmate, I knew from the moment we met."',
            'Texting constantly and getting upset if you don\'t reply immediately',
            'Planning your future together within weeks of meeting',
        ],
        healthyAlternative: 'Healthy love builds gradually with mutual respect for boundaries and personal space.',
    },
    {
        id: 'darvo',
        name: 'DARVO',
        // icon: '',
        severity: 'high',
        description: 'Deny the behavior, Attack the person confronting them, Reverse the roles of Victim and Offender.',
        signs: [
            'Flat-out denying harmful behavior',
            'Attacking your character when confronted',
            'Playing the victim when they caused harm',
            '"Look what you made me do"',
            'Turning the conversation into how YOU hurt THEM',
        ],
        examples: [
            '"I didn\'t do that, and frankly I\'m hurt you would accuse me."',
            '"You\'re the one who\'s been treating ME badly."',
            '"After everything I\'ve done for you, THIS is how you repay me?"',
        ],
        healthyAlternative: 'In healthy relationships, people can accept responsibility for their actions without deflecting.',
    },
    {
        id: 'isolation',
        name: 'Isolation',
        // icon: '',
        severity: 'high',
        description: 'Gradually cutting someone off from their support network, friends, family, and other relationships.',
        signs: [
            'Criticizing your friends or family',
            'Making you choose between them and others',
            'Getting jealous of time spent with others',
            'Moving you away from your support network',
            'Monitoring who you talk to',
        ],
        examples: [
            '"Your friends are a bad influence on you."',
            '"Your family doesn\'t understand us."',
            '"I just want you all to myself, is that so wrong?"',
        ],
        healthyAlternative: 'Healthy partners encourage you to maintain and grow your relationships with others.',
    },
    {
        id: 'minimizing',
        name: 'Minimizing',
        // icon: '',
        severity: 'medium',
        description: 'Downplaying someone\'s feelings, experiences, or concerns to make them seem unimportant.',
        signs: [
            '"It wasn\'t that bad"',
            '"You\'re making a big deal out of nothing"',
            'Comparing your pain to others\' to dismiss it',
            'Laughing off your concerns',
            'Changing the subject when you express hurt',
        ],
        examples: [
            '"Other people have it way worse than you."',
            '"It was just a joke, don\'t be so sensitive."',
            '"That happened ages ago, why are you still upset?"',
        ],
        healthyAlternative: 'In healthy relationships, your feelings are acknowledged and validated, even when someone doesn\'t fully understand them.',
    },
    {
        id: 'silent-treatment',
        name: 'Silent Treatment',
        // icon: '',
        severity: 'medium',
        description: 'Deliberately ignoring or refusing to communicate as a form of punishment or control.',
        signs: [
            'Ignoring you for days after a disagreement',
            'Refusing to discuss issues',
            'Withholding affection as punishment',
            'Acting as if you don\'t exist',
            'Making you beg for communication',
        ],
        examples: [
            'Going completely silent for days without explanation',
            'Reading your messages but not responding',
            'Leaving the room every time you try to talk',
        ],
        healthyAlternative: 'Healthy communication includes asking for space when needed while reassuring the other person you\'ll return to the conversation.',
    },
    {
        id: 'guilt-tripping',
        name: 'Guilt Tripping',
        // icon: '',
        severity: 'medium',
        description: 'Using guilt to manipulate someone into doing what you want or to make them feel bad about their choices.',
        signs: [
            '"After everything I\'ve done for you..."',
            'Bringing up past favors during arguments',
            'Making you feel responsible for their happiness',
            'Sighing, moping, or acting hurt to get their way',
            'Framing their desires as your obligation',
        ],
        examples: [
            '"I guess I\'ll just sit here alone then."',
            '"Fine, do what you want, I don\'t matter anyway."',
            '"I sacrificed so much for you and this is what I get?"',
        ],
        healthyAlternative: 'Healthy relationships involve expressing needs directly rather than using guilt as leverage.',
    },
    {
        id: 'future-faking',
        name: 'Future Faking',
        // icon: '',
        severity: 'medium',
        description: 'Making grand promises about the future with no real intention of following through, used to keep someone invested.',
        signs: [
            'Big promises that never materialize',
            '"Things will be different, I promise"',
            'Planning a future to distract from present problems',
            'Using future plans to avoid current accountability',
            'Pattern of broken promises',
        ],
        examples: [
            '"Next month I\'ll change, I swear."',
            '"Once we move in together, everything will be better."',
            '"I\'m going to get help, just give me more time."',
        ],
        healthyAlternative: 'Healthy partners follow through on commitments and address present issues rather than deflecting to future promises.',
    },
];

/**
 * GET /api/patterns
 * Returns the full pattern library
 */
router.get('/', (req, res) => {
    res.json({ success: true, patterns: PATTERNS });
});

/**
 * GET /api/patterns/:id
 * Returns a single pattern by ID
 */
router.get('/:id', (req, res) => {
    const pattern = PATTERNS.find(p => p.id === req.params.id);
    if (!pattern) {
        return res.status(404).json({ error: 'Pattern not found' });
    }
    res.json({ success: true, pattern });
});

module.exports = router;
