export declare interface ValidationError {
    errorType: ErrorType;
    errorString: string;
}

export declare type ValidationResponse = ValidationError | undefined;

export const enum ErrorType {
    CLIENT_DOES_NOT_EXIST = 'CLIENT_DOES_NOT_EXIST',
    CLIENT_ALREADY_HAS_PLAYER = 'CLIENT_ALREADY_HAS_PLAYER',
    PLAYER_DOES_NOT_EXIST = 'PLAYER_DOES_NOT_EXIST',
    CLIENT_HAS_NOT_JOINED_GAME = 'CLIENT_HAS_NOT_JOINED_GAME',
    ILLEGAL_ACTION = 'ILLEGAL_ACTION',
    TYPE_ERROR = 'TYPE_ERROR',
    OUT_OF_TURN = 'OUT_OF_TURN',
    MAX_NAME_LENGTH_EXCEEDED = 'MAX_NAME_LENGTH_EXCEEDED',
    NOT_ENOUGH_CHIPS = 'NOT_ENOUGH_CHIPS',
    SEAT_IS_TAKEN = 'SEAT_IS_TAKEN',
    ILLEGAL_BETTING_ACTION = 'ILLEGAL_BETTING_ACTION',
    MAX_CHAT_MESSAGE_LENGTH_EXCEEDED = 'MAX_CHAT_MESSAGE_LENGTH_EXCEEDED',
    NOT_IMPLEMENTED_YET = 'NOT_IMPLEMENTED_YET',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NOT_ADMIN = 'NOT_ADMIN',
    NO_MORE_TIMEBANKS = 'NO_MORE_TIMEBANKS',
}

export const NOT_IMPLEMENTED_YET: ValidationResponse = {
    errorType: ErrorType.NOT_IMPLEMENTED_YET,
    errorString: "This code path hasn't been implemented yet.",
};

export const INTERNAL_SERVER_ERROR: ValidationResponse = {
    errorType: ErrorType.INTERNAL_SERVER_ERROR,
    errorString: 'There has been an internal server error.',
};
