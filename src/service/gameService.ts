import { Service } from "typedi";
import { Room } from '../models/gameState';
import { Player } from '../models/player';

@Service()
// maybe this can be renamed to RoomService :)
export class GameService {

    // createRoom(): Room {
    //     // since there is only one room for now, this shouldn't be complicated
    //     // in the future, this function could try to delegate different rooms
    //     // to different instances

    //     return {
    //         hosts: [host],
    //         players: []
    //     };
    // }

    // joinRoom() {


    // }

}