export declare interface ValidationResponse {
    errorType: ErrorType;
    errorString: string;
  }
  
  export const enum ErrorType {
  NO_ERROR = 'NO_ERROR',
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
  MAX_CHAT_MESSAGE_LENGTH_EXCEEDED = "MAX_CHAT_MESSAGE_LENGTH_EXCEEDED",
  NOT_IMPLEMENTED_YET = "NOT_IMPLEMENTED_YET"
}
  
  export const NO_ERROR: ValidationResponse = {
    errorType: ErrorType.NO_ERROR,
    errorString: '',
  };
  
  export const NOT_IMPLEMENTED_YET: ValidationResponse = {
    errorType: ErrorType.NOT_IMPLEMENTED_YET,
    errorString: "This code path hasn't been implemented yet."
  };