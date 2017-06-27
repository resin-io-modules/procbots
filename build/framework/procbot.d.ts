import * as Promise from 'bluebird';
import { ServiceEmitRequest, ServiceEmitResponse, ServiceEmitter, ServiceListener } from '../services/service-types';
import { Logger } from '../utils/logger';
<<<<<<< HEAD
import { ConfigurationLocation, ProcBotConfiguration } from './procbot-types';
=======
import { ProcBotConfiguration } from './procbot-types';
<<<<<<< HEAD
import { BotDefinitionContext } from '../RASP/Antlr/RASPParser';
>>>>>>> Add start of generator.
=======
>>>>>>> Update current WIP.
export declare class ProcBot {
    protected _botname: string;
    protected logger: Logger;
    private emitters;
    private listeners;
    private nodeBinPath;
    constructor(name?: string);
    getNodeBinPath(): Promise<string>;
    protected processConfiguration(configFile: string): ProcBotConfiguration | void;
    protected retrieveConfiguration(details: ConfigurationLocation): Promise<ProcBotConfiguration | void>;
    protected addServiceListener(name: string, data?: any): ServiceListener | void;
    protected addServiceEmitter(name: string, data?: any): ServiceEmitter | void;
    protected getListener(name: string): ServiceListener | void;
    protected getEmitter(name: string): ServiceEmitter | void;
    protected dispatchToAllEmitters(data: ServiceEmitRequest): Promise<ServiceEmitResponse[]>;
    protected dispatchToEmitter(name: string, data: any): Promise<any>;
    private getService(name);
}
