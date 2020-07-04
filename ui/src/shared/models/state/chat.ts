import { PlayerUUID } from '../system/uuid';
import { JP_VERSION } from '../../util/consts';
import { shuffle } from '../../util/util';

/** Not sensitive */
export const MAGIC_SERVER_SEAT_NUMBER = 9452;
export const SERVER_PLAYER_UUID = 'jp-server' as PlayerUUID;

export enum ServerMessageType {
    WELCOME = 'WELCOME',
    REPLENISH_TIMEBANK = 'REPLENISH_TIMEBANK',
    TIP_MESSAGE = 'SHOW_CARDS_TIP',
}

export declare interface ChatLog {
    messages: ChatMessage[];
    messageTipIndex: number;
}

export declare interface ChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID: PlayerUUID;
    seatNumber: number;
}

export function getCleanChatLog(): ChatLog {
    return {
        messages: [],
        messageTipIndex: 0,
    };
}

export const replenishTimeBankMessage = 'Replenishing one time bank for all players.';

export const welcomeMessageTip =
    `Welcome to JustPoker ${JP_VERSION}! Check out the menu in the ` +
    `top left to change the app's appearance, and (for admins) to set game parameters. May the suits be with you.`;

const showCardsTip =
    'Tip: To show your cards after a hand, mouse-over your cards and ' +
    'click either on the card you want to show, or on "Show All"';

const showCardsHeadsUpTip =
    'Tip: Did you know, that when heads-up (1 v 1), you can show your cards even while the hand is in progress? ' +
    'Just ask the admin to enable the feature in the game settings.';

const ledgerTip =
    "Don't remember who bought in for how much? Wanna know how much you're up? " +
    'Check out the ledger! Find it in the menu in the top-left.';

const cardBackgroundTip =
    'Customize the cards to your liking in the user settings menu, found in the top-left of the app.';

const avatarTip = 'Bored of your avatar? Try a different one! Bring up the selection menu by clicking your avatar.';

const handLogTip = 'Forgot who raise pre-flop? Check the handlog! Find it in the log panel on the right-hand side.';

const autoBetTip =
    'Made up your mind already? You can pre-select the Check, Fold, and Bet ' +
    'buttons to immediately perform that aciton when it is your turn.';

export const ALL_TIPS = [
    showCardsTip,
    showCardsHeadsUpTip,
    ledgerTip,
    cardBackgroundTip,
    avatarTip,
    handLogTip,
    autoBetTip,
];
shuffle(ALL_TIPS);
