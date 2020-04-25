import { SUIT, Card } from '../../src/types';
const { removeFirstMatch } = require('../db/round');

describe('removeFirstMatch', () => {
    test('remove only first match', () => {
        const cards: Card[] = [{ suit: SUIT.JESTER, number: null }, { suit: SUIT.JESTER, number: null }];
        const newCards: Card[] = removeFirstMatch(cards, SUIT.JESTER, null);
        expect(newCards).toEqual([
            { suit: SUIT.JESTER, number: null }
        ]);
    });

    test('removes nothing when not in array', () => {
        const cards: Card[] = [{ suit: SUIT.JESTER, number: null }, { suit: SUIT.JESTER, number: null }];
        const newCards: Card[] = removeFirstMatch(cards, 'wizard', null);
        expect(newCards).toEqual([
            { suit: SUIT.JESTER, number: null }, { suit: SUIT.JESTER, number: null },
        ]);
    });

    test('removes when unique', () => {
        const cards: Card[] = [{ suit: SUIT.JESTER, number: null }, { suit: SUIT.CLUBS, number: 1 }];
        const newCards: Card[] = removeFirstMatch(cards, SUIT.JESTER, null);
        expect(newCards).toEqual([
            { suit: SUIT.CLUBS, number: 1 }
        ]);
    })
})
