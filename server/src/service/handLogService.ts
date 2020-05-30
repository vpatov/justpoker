import { Service } from 'typedi';
import {GameInstanceLog} from '../../../ui/src/shared/models/handLog';


@Service()
export class HandLogService {

    gameInstanceLog: GameInstanceLog;

}