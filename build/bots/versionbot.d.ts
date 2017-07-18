import * as Promise from 'bluebird';
import { ProcBot } from '../framework/procbot';
import { GithubRegistration } from '../services/github-types';
import { ServiceEvent } from '../services/service-types';
export declare class VersionBot extends ProcBot {
    private githubListenerName;
    private githubAppEmitter;
    private githubUserEmitter;
    private githubAppApi;
    private githubUserApi;
    private emailAddress;
    constructor(integration: number, name: string, email: string, pemString: string, webhook: string, pat: string);
    protected statusChange: (registration: GithubRegistration, event: ServiceEvent) => Promise<void | void[]>;
    protected checkWaffleFlow: (_registration: GithubRegistration, event: ServiceEvent) => Promise<void>;
    protected addReviewers: (_registration: GithubRegistration, event: ServiceEvent) => Promise<void>;
    protected checkReviewers: (_registration: GithubRegistration, event: ServiceEvent) => Promise<void>;
    protected checkFooterTags: (_registration: GithubRegistration, event: ServiceEvent) => Promise<void>;
    protected mergePR: (_registration: GithubRegistration, event: ServiceEvent) => Promise<void>;
    private applyVersionist(versionData);
    private createCommitBlobs(repoData);
    private mergeToMaster(data);
    private checkStatuses(prInfo);
    private getVersionBotCommits(prInfo);
    private finaliseMerge;
    private stripPRAuthor(list, pullRequest);
    private checkValidMaintainer(config, event);
    private checkCommitFooterTags(allCommits, config);
    private reportError(error);
}
export declare function createBot(): VersionBot;
