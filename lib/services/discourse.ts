/*
 Copyright 2016-2017 Resin.io

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as path from 'path';
import { UrlOptions } from 'request';
import * as request from 'request-promise';
import { RequestPromiseOptions } from 'request-promise';
import {
	DiscourseConstructor, DiscourseEmitContext, DiscourseHandle,
	DiscourseListenerConstructor, DiscourseResponse,
} from './discourse-types';
import { ServiceScaffold } from './service-scaffold';
import { ServiceScaffoldEvent } from './service-scaffold-types';
import { ServiceEmitter, ServiceListener, ServiceType } from './service-types';

/**
 * A ProcBot service for interacting with the Discourse API
 */
export class DiscourseService extends ServiceScaffold<string> implements ServiceListener, ServiceEmitter {
	private static _serviceName = path.basename(__filename.split('.')[0]);
	// There are circumstances in which the discourse web-hook will fire twice for the same post, so track.
	private postsSynced = new Set<number>();
	private connectionDetails: DiscourseConstructor;

	constructor(data: DiscourseConstructor | DiscourseListenerConstructor) {
		super(data);
		// #203: Verify connection data
		this.connectionDetails = data;
		if (data.type === ServiceType.Listener) {
			const listenerData = <DiscourseListenerConstructor>data;
			// Register our enqueue action for when the express instance receives a web-hook
			this.registerHandler(listenerData.path || DiscourseService._serviceName, (formData, response) => {
				// Check this event is new
				if (!this.postsSynced.has(formData.body.post.id)) {
					this.postsSynced.add(formData.body.post.id);
					this.queueData({
						context: formData.body.post.topic_id,
						cookedEvent: {},
						type: formData.headers['x-discourse-event'],
						rawEvent: formData.body.post,
						source: DiscourseService._serviceName,
					});
					response.sendStatus(200);
				}
			});
		}
	}

	/**
	 * Promise to deliver the payload to the API.
	 * @param  requestOptions Payload to be delivered, in `request` format.
	 * @returns Promise that resolves to the response from the API call.
	 */
	public request(requestOptions: UrlOptions & RequestPromiseOptions): Promise<DiscourseResponse> {
		// This type massages request-promise into bluebird
		return request(requestOptions).promise();
	}

	/**
	 * Actually emit the data to the API.
	 * Extracting the context will have been done by the serviceScaffold.
	 * @param context  Context to be emitted
	 * @returns        Promise that resolves to the API response
	 */
	protected emitData(context: DiscourseEmitContext): Promise<DiscourseResponse> {
		// Inject credentials into the provided querystring
		const qs = {
			api_key: this.connectionDetails.token,
			api_username: this.connectionDetails.username,
		};
		_.merge(qs, context.data.qs);
		// Massage and send the context
		const requestOptions = {
			body: context.data.body,
			json: true,
			qs,
			qsStringifyOptions: {
				arrayFormat: 'repeat',
			},
			url: `${this.connectionDetails.protocol || 'https'}://${this.connectionDetails.instance}${context.data.path}`,
			method: context.data.htmlVerb,
		};
		return context.method(requestOptions);
	}

	/**
		* Verify the event before enqueueing.  For now uses the naive approach of returning true.
		*/
	protected verify(_data: ServiceScaffoldEvent): boolean {
		// #202: This to be properly implemented.
		return true;
	}

	/**
	 * Get the service name, as required by the framework.
	 * @returns  The service name for Discourse.
	 */
	get serviceName(): string {
		return DiscourseService._serviceName;
	}

	/**
	 * Retrieve Discourse API SDK handle (currently none).
	 * @returns void (currently no Discourse SDK API handle).
	 */
	get apiHandle(): DiscourseHandle {
		return {
			discourse: this,
		};
	}
}

/**
 * Build this class, typed and activated as a listener.
 * @returns  Service Listener object, awakened and ready to go.
 */
export function createServiceListener(data: DiscourseListenerConstructor): ServiceListener {
	return new DiscourseService(data);
}

/**
 * Build this class, typed as an emitter.
 * @returns  Service Emitter object, ready for your events.
 */
export function createServiceEmitter(data: DiscourseConstructor): ServiceEmitter {
	return new DiscourseService(data);
}
