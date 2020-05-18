import { Service } from 'typedi';
import { GameInstanceManager } from './gameInstanceManager';
import { MessageService } from './messageService';

@Service()
export class EventProcessor {
    constructor(
        private readonly gameInstanceManager: GameInstanceManager,
        private readonly messageService: MessageService,
    ) {}

    processEventForGame(gameInstanceUUID: string, eventData: any) {
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);

        // TODO process message

        // either process via messageService or via stateGraphManager
        // now im thinking maybe the flow should be singlular, that is all events get processed through messageService
        // timeouts can essentially look like another message from client or whatever
        // MessageService already acts as an event dispatcher, so its sort overly complicated to have two eventDisptachers
        // as long as every message contains a gameInstanceUUID, we can call this.gameInstanceManager.loadGameInstance(gameInstanceUUID), on Recieve of any message
    }
}
