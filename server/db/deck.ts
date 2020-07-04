import {
    Card, SUIT,
} from '../../src/types';

const sortCards = (cards: Card[]) => {
    const suitOrder: Record<SUIT, number> = {
        [SUIT.WIZARD]: 0,
        [SUIT.JESTER]: 1,
        [SUIT.SPADES]: 2,
        [SUIT.HEARTS]: 3,
        [SUIT.CLUBS]: 4,
        [SUIT.DIAMONDS]: 5,
    };

    // sort the cards first
    const compareCards = (card1: Card, card2: Card) => {
        if (card1.suit === card2.suit) {
            if (card1.number === 1) {
                return -1;
            } if (card2.number === 1) {
                return 1;
            }
            return card2.number - card1.number; // high cards first
        }
        return suitOrder[card1.suit] - suitOrder[card2.suit];
    };
    return cards.sort(compareCards);
};

const createDeck = () => {
    const cards: Card[] = [];

    for (const specialSuit of [SUIT.WIZARD, SUIT.JESTER]) {
        for (let value = 0; value < 4; value += 1) {
            cards.push({ suit: specialSuit, number: null });
        }
    }

    for (const suit of [SUIT.SPADES, SUIT.CLUBS, SUIT.HEARTS, SUIT.DIAMONDS]) {
        for (let value = 1; value < 14; value += 1) {
            cards.push({ suit, number: value });
        }
    }
    return cards;
};

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffleYourDeck = (array: Card[]) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export {
    sortCards,
    createDeck,
    shuffleYourDeck,
};
