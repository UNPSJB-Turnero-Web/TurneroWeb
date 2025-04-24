import { PlayType } from '../playType/playType';

export interface Play {
    id: number;
    code: string;
    name: string;
    type: PlayType;
    
}