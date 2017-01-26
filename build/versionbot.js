"use strict";
const GithubBot = require("./githubbot");
const Promise = require("bluebird");
const _ = require("lodash");
const path = require("path");
const temp = Promise.promisifyAll(require('temp'));
const mkdirp = Promise.promisify(require('mkdirp'));
const rmdir = Promise.promisify(require('rmdir'));
const exec = Promise.promisify(require('child_process').exec);
const fs = Promise.promisifyAll(require('fs'));
const GithubApi = require('github');
class VersionBot extends GithubBot.GithubBot {
    constructor(integration) {
        super(integration);
        this.checkVersioning = (action, data) => {
            const githubApi = this.githubApi;
            const pr = data.pull_request;
            const head = data.pull_request.head;
            const owner = head.repo.owner.login;
            const name = head.repo.name;
            console.log('PR has been opened or synchronised, check for commits');
            console.log(data.action);
            if ((data.action !== 'opened') && (data.action !== 'synchronize')) {
                return Promise.resolve();
            }
            return this.gitCall(githubApi.pullRequests.getCommits, {
                owner: owner,
                repo: name,
                number: pr.number
            }).then((commits) => {
                let changetypeFound = false;
                for (let index = 0; index < commits.length; index += 1) {
                    const commit = commits[index];
                    const commitMessage = commit.commit.message;
                    const invalidCommit = !commitMessage.match(/^change-type:\s*(patch|minor|major)\s*$/mi);
                    if (!invalidCommit) {
                        changetypeFound = true;
                        break;
                    }
                }
                if (changetypeFound) {
                    return this.gitCall(githubApi.repos.createStatus, {
                        owner: owner,
                        repo: name,
                        sha: head.sha,
                        state: 'success',
                        description: 'Found a valid Versionist `Change-Type` tag',
                        context: 'Versionist'
                    }).return(true);
                }
                return this.gitCall(githubApi.repos.createStatus, {
                    owner: owner,
                    repo: name,
                    sha: head.sha,
                    state: 'failure',
                    description: 'None of the commits in the PR have a `Change-Type` tag',
                    context: 'Versionist'
                }).return(false);
            }).then(() => {
                return this.gitCall(githubApi.repos.getCommit, {
                    owner,
                    repo: name,
                    sha: head.sha
                }).then((headCommit) => {
                    const commit = headCommit.commit;
                    const files = headCommit.files;
                    if ((commit.committer.name === 'Versionbot') &&
                        _.find(files, (file) => {
                            return file.filename === 'CHANGELOG.md';
                        })) {
                        const commitVersion = commit.message;
                        return this.gitCall(githubApi.pullRequests.merge, {
                            owner,
                            repo: name,
                            number: pr.number,
                            commit_title: `Auto-merge for PR ${pr.number} via Versionbot`
                        }, 3).then((mergedData) => {
                            return this.gitCall(githubApi.gitdata.createTag, {
                                owner,
                                repo: name,
                                tag: commitVersion,
                                message: commitVersion,
                                object: mergedData.sha,
                                type: 'commit',
                                tagger: {
                                    name: 'Versionbot',
                                    email: 'versionbot@whaleway.net'
                                }
                            });
                        }).then((newTag) => {
                            console.log(newTag);
                            return this.gitCall(githubApi.gitdata.createReference, {
                                owner,
                                repo: name,
                                ref: `refs/tags/${commitVersion}`,
                                sha: newTag.sha
                            });
                        });
                    }
                });
            });
        };
        this.mergePR = (action, data) => {
            const githubApi = this.githubApi;
            const pr = data.pull_request;
            const head = data.pull_request.head;
            const owner = head.repo.owner.login;
            const name = head.repo.name;
            let approvePromise = Promise.resolve(false);
            let labelPromise = Promise.resolve(false);
            console.log('PR has been updated with comments or a label');
            const getReviewComments = () => {
                return this.gitCall(githubApi.pullRequests.getReviews, {
                    owner: owner,
                    repo: name,
                    number: pr.number
                }).then((reviews) => {
                    let approved = false;
                    reviews.forEach((review) => {
                        if (review.state === 'APPROVED') {
                            approved = true;
                        }
                        else if (review.state === 'CHANGES_REQUESTED') {
                            approved = false;
                        }
                    });
                    return approved;
                });
            };
            const getLabels = () => {
                return this.gitCall(githubApi.issues.getIssueLabels, {
                    owner: owner,
                    repo: name,
                    number: pr.number
                }).then((labels) => {
                    let mergeLabelFound = false;
                    labels.forEach((label) => {
                        if (label.name === 'flow/ready-to-merge') {
                            mergeLabelFound = true;
                        }
                    });
                    return mergeLabelFound;
                });
            };
            switch (data.action) {
                case 'submitted':
                    if (data.review.state === 'changes_requested') {
                        return Promise.resolve();
                    }
                    else if (data.review.state === 'approved') {
                        approvePromise = Promise.resolve(true);
                    }
                    else {
                        approvePromise = getReviewComments();
                    }
                    labelPromise = getLabels();
                    break;
                case 'labeled':
                case 'unlabeled':
                    if (data.label.name === 'flow/ready-to-merge') {
                        if (data.action === 'unlabeled') {
                            console.log('Label: deleted');
                            return Promise.resolve();
                        }
                        labelPromise = Promise.resolve(true);
                    }
                    else {
                        labelPromise = getLabels();
                    }
                    approvePromise = getReviewComments();
                    break;
                default:
                    console.log(`Data action wasn't useful for merging`);
                    return Promise.resolve();
            }
            return Promise.all([
                approvePromise,
                labelPromise
            ]).then((results) => {
                if (!_.includes(results, false)) {
                    return this.generateVersion(owner, name, pr.number);
                }
                console.log(`Unable to merge: PRapproved(${results[0]}, Labels(${results[1]})`);
            });
        };
        this.generateVersion = (owner, repo, pr) => {
            console.log('PR is ready to merge, attempting to carry out a version up.');
            const githubApi = this.githubApi;
            const repoFullName = `${owner}/${repo}`;
            const cwd = process.cwd();
            let newVersion;
            let fullPath;
            let branchName;
            let newTreeSha;
            ;
            return this.gitCall(githubApi.pullRequests.get, {
                owner: owner,
                repo: repo,
                number: pr
            }).then((prInfo) => {
                branchName = prInfo.head.ref;
                return temp.mkdirAsync(`${repo}-${pr}_`).then((tempDir) => {
                    fullPath = `${tempDir}${path.sep}`;
                    const promiseResults = [];
                    return Promise.mapSeries([
                        `git clone https://${process.env.WEBHOOK_SECRET}:x-oauth-basic@github.com/${repoFullName} ${fullPath}`,
                        `git checkout ${branchName}`,
                        'versionist',
                        'git status -s'
                    ], (command) => {
                        return exec(command, { cwd: fullPath });
                    }).get(3);
                });
            }).then((status) => {
                let changeLines = status.split('\n');
                const moddedFiles = [];
                let changeLogFound = false;
                if (changeLines.length === 0) {
                    throw new Error(`Couldn't find any status changes after running 'versionist', exiting`);
                }
                changeLines = _.slice(changeLines, 0, changeLines.length - 1);
                changeLines.forEach((line) => {
                    const match = line.match(/^\sM\s(.+)$/);
                    if (!match) {
                        throw new Error(`Found a spurious git status entry: ${line.trim()}, abandoning version up`);
                    }
                    else {
                        if (match[1] !== 'CHANGELOG.md') {
                            moddedFiles.push(match[1]);
                        }
                        else {
                            changeLogFound = true;
                        }
                    }
                });
                if (!changeLogFound) {
                    throw new Error(`Couldn't find the CHANGELOG.md file, abandoning version up`);
                }
                moddedFiles.push(`CHANGELOG.md`);
                return exec(`cat ${fullPath}${_.last(moddedFiles)}`).then((contents) => {
                    const match = contents.match(/^## (v[0-9]\.[0-9]\.[0-9]).+$/m);
                    if (!match) {
                        throw new Error('Cannot find new version for ${repo}-${pr}');
                    }
                    newVersion = match[1];
                }).return(moddedFiles);
            }).then((files) => {
                return Promise.map(files, (file) => {
                    return fs.readFileAsync(`${fullPath}${file}`).call(`toString`, 'base64').then((encoding) => {
                        let newFile = {
                            file,
                            encoding
                        };
                        return newFile;
                    });
                });
            }).then((files) => {
                return this.gitCall(githubApi.gitdata.getTree, {
                    owner,
                    repo,
                    sha: branchName
                }).then((treeData) => {
                    return Promise.map(files, (file) => {
                        file.treeEntry = _.find(treeData.tree, (treeEntry) => {
                            return treeEntry.path === file.file;
                        });
                        if (!file.treeEntry) {
                            throw new Error(`Couldn't find a git tree entry for the file ${file.file}`);
                        }
                        return this.gitCall(githubApi.gitdata.createBlob, {
                            owner,
                            repo,
                            content: file.encoding,
                            encoding: 'base64'
                        }).then((blob) => {
                            file.treeEntry.sha = blob.sha;
                        }).return(file);
                    }).then((files) => {
                        const newTree = [];
                        files.forEach((file) => {
                            newTree.push({
                                path: file.treeEntry.path,
                                mode: file.treeEntry.mode,
                                type: 'blob',
                                sha: file.treeEntry.sha
                            });
                        });
                        return this.gitCall(githubApi.gitdata.createTree, {
                            owner,
                            repo,
                            tree: newTree,
                            base_tree: treeData.sha
                        });
                    }).then((newTree) => {
                        newTreeSha = newTree.sha;
                        return this.gitCall(githubApi.repos.getCommit, {
                            owner,
                            repo,
                            sha: `${branchName}`
                        });
                    }).then((lastCommit) => {
                        return this.gitCall(githubApi.gitdata.createCommit, {
                            owner,
                            repo,
                            message: `${newVersion}`,
                            tree: newTreeSha,
                            parents: [lastCommit.sha],
                            committer: {
                                name: 'Versionbot',
                                email: 'versionbot@whaleway.net'
                            }
                        });
                    }).then((commit) => {
                        return this.gitCall(githubApi.gitdata.updateReference, {
                            owner,
                            repo,
                            ref: `heads/${branchName}`,
                            sha: commit.sha,
                            force: false
                        });
                    });
                });
            }).then(() => {
                console.log(`Upped version of ${repoFullName} to ${newVersion}; tagged and pushed.`);
            }).catch((err) => {
                console.log(err);
            });
        };
        this._botname = 'VersionBot';
        const registrations = [
            {
                name: 'CheckVersionistCommitStatus',
                events: ['pull_request'],
                suppressionLabels: ['flow/no-version-checks'],
                workerMethod: this.checkVersioning
            },
            {
                name: 'CheckForReadyMergeState',
                events: ['pull_request', 'pull_request_review'],
                triggerLabels: ['flow/ready-to-merge'],
                suppressionLabels: ['flow/no-version-checks'],
                workerMethod: this.mergePR
            }
        ];
        _.forEach(registrations, (reg) => {
            this.registerAction(reg);
        });
        this.authenticate();
    }
}
exports.VersionBot = VersionBot;
function createBot(integration) {
    return new VersionBot(process.env.INTEGRATION_ID);
}
exports.createBot = createBot;

//# sourceMappingURL=versionbot.js.map
