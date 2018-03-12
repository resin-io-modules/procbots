/*
 Copyright 2017 Resin.io

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
import * as marked from 'marked';
import {
	BasicMessageInformation,
	EmitInstructions,
	MessengerConstructor,
	MessengerEvent,
	MessengerResponse,
	PrivacyPreference,
	SourceDescription,
	TransmitInformation,
} from '../../messenger-types';
import { ServiceScaffoldConstructor, ServiceScaffoldEvent } from '../../service-scaffold-types';
import { Translator, TranslatorError } from './translator';
import {
	EmitConverters,
	EventEquivalencies,
	MetadataConfiguration,
	PublicityIndicators,
	ResponseConverters,
	TranslatorErrorCode,
	TranslatorMetadata,
} from './translator-types';

export enum MetadataEncoding {
	HiddenHTML, HiddenMD, Flowdock,
}

/**
 * Class to help build a translator to convert between messenger standard forms
 * and service specific forms.
 */
export abstract class TranslatorScaffold implements Translator {
	/**
	 * Extract the thread id for the referenced service from an array of messages.
	 * @param service   Service of interest.
	 * @param messages  Message to search.
	 * @param config      Configuration that may have been used to encode metadata.
	 * @param format    Format used to encode the metadata.
	 */
	public static extractSource(
		service: string,
		messages: string[],
		config: MetadataConfiguration,
		format?: MetadataEncoding,
	): SourceDescription {
		const idFinder = new RegExp(`${service} ?\\S* thread ([\\w\\d-+\\/=\\_]+)`);
		const matches = _.compact(_.map(
			messages,
			(message) => {
				if (format) {
					const metadata = TranslatorScaffold.extractMetadata(message, format, config);
					if ((metadata.service === service) && metadata.thread && metadata.flow) {
						return {
							flow: metadata.flow,
							service: metadata.service,
							thread: metadata.thread,
						};
					}
				}
				const match = message.match(idFinder);
				return match && { thread: match[1] };
			},
		));
		// Let upstream know what we've found.
		if (matches.length > 0) {
			return matches[0];
		}
		throw new TranslatorError(
			TranslatorErrorCode.ValueNotFound, `No connected thread found for ${service}.`
		);
	}

	/**
	 * Extracts the words from a string that is formatted in html or markdown.
	 * @param message  string to extract words from.
	 * @returns        array of the words.
	 */
	public static extractWords(message: string): string[] {
		// Nerf it to lower case
		const lowerCaseString = message.toLowerCase();
		// Convert any markdown to html
		const htmlString = marked(lowerCaseString);
		// Remove any html tags
		const cleanedString = htmlString.replace(/<[^>]*>/g, ' ');
		// Break the string down to word sections
		return cleanedString.match(/\w+/g) || [];
	}

	/**
	 * Converts the usernames within a message string using a specified converter.
	 * @param message    String to replace usernames within
	 * @param converter  Function to use to convert each username
	 * @returns          String with the usernames converted
	 */
	public static convertPings(message: string, converter: (username: string) => string): string {
		return message.trim().replace(/(?:^|\W)@([\w-_]+)/gi, (fullMatch, capture) => {
			return fullMatch.replace(capture, converter(capture));
		});
	}

	public static unixifyNewLines(message: string): string {
		return message.replace(/\r\n?/, '\n');
	}

	public static findPublicityWord(hidden: PrivacyPreference, indicators: PublicityIndicators): string {
		switch (hidden) {
			case true:
				return indicators.hidden;
			case false:
				return indicators.shown;
			case 'preferred':
				return indicators.hiddenPreferred;
			default:
				throw new TranslatorError(TranslatorErrorCode.EmitUnsupported, 'Privacy type not supported');
		}
	}

	public static findPublicityFromWord(word: string, indicators: PublicityIndicators): PrivacyPreference {
		switch (word) {
			case indicators.hidden:
				return true;
			case indicators.shown:
				return false;
			case indicators.hiddenPreferred:
				return 'preferred';
			default:
				throw new TranslatorError(TranslatorErrorCode.EmitUnsupported, 'Privacy type not supported');
		}
	}

	/**
	 * Encode the metadata of an event into a string to embed in the message.
	 * @param data    Event to gather details from.
	 * @param format  Optional, markdown or plaintext, defaults to markdown.
	 * @param config  Configuration that should be used to encode the metadata.
	 * @returns       Text with data embedded.
	 */
	public static stringifyMetadata(
		data: BasicMessageInformation, format: MetadataEncoding, config: MetadataConfiguration,
	): string {
		const pubWord = TranslatorScaffold.findPublicityWord(data.details.hidden, config.publicity);
		const source = data.source;
		const queryString = `?hidden=${pubWord}&source=${source.service}&flow=${source.flow}&thread=${source.thread}`;
		switch (format) {
			case MetadataEncoding.HiddenHTML:
				return `<a href="${config.baseUrl}${queryString}"></a>`;
			case MetadataEncoding.HiddenMD:
				return `[](${config.baseUrl}${queryString})`;
			default:
				throw new Error(`${format} format not recognised`);
		}
	}

	/**
	 * Given a basic string this will extract a more rich context for the event, if embedded.
	 * @param message  Basic string that may contain metadata.
	 * @param format   Format of the metadata encoding.
	 * @param config   Configuration that may have used to encode metadata.
	 * @returns        Object of content, genesis and hidden.
	 */
	public static extractMetadata(
		message: string, format: MetadataEncoding, config: MetadataConfiguration,
	): TranslatorMetadata {
		const wordCapture = `(${_.values(config.publicity).join('|')})`;
		const querystring = `\\?hidden=${wordCapture}&source=(\\w*)&flow=([^"&\\)]*)&thread=([^"&\\)]*)`;
		const baseUrl = _.escapeRegExp(config.baseUrl);
		const publicity = config.publicity;
		switch (format) {
			case MetadataEncoding.HiddenHTML:
				const hiddenHTMLRegex = new RegExp(`<a href="${baseUrl}${querystring}"[^>]*></a>$`, 'i');
				return TranslatorScaffold.metadataByRegex(message, hiddenHTMLRegex, publicity);
			case MetadataEncoding.HiddenMD:
				const hiddenMDRegex = new RegExp(`\\[\\]\\(${baseUrl}${querystring}\\)$`, 'i');
				return TranslatorScaffold.metadataByRegex(message, hiddenMDRegex, publicity);
			default:
				throw new Error(`${format} format not recognised`);
		}
	}

	/**
	 * Generic handler for stock metadata regex, must match the syntax of:
	 * first match is the indicator of visibility, second match is message source, remove the whole match for content.
	 * @param message     String to evaluate into metadata.
	 * @param regex       Criteria for extraction.
	 * @param indicators  Strings that may have been used to indicate privacy.
	 * @returns           Object of the metadata, decoded.
	 */
	public static metadataByRegex(message: string, regex: RegExp, indicators: PublicityIndicators): TranslatorMetadata {
		const metadata = message.match(regex);
		const content = TranslatorScaffold.unixifyNewLines(message.replace(regex, '').trim());
		if (metadata) {
			return {
				content,
				flow: metadata[3] || null,
				service: metadata[2] || null,
				hidden: TranslatorScaffold.findPublicityFromWord(metadata[1], indicators),
				thread: metadata[4] || null,
			};
		}
		return TranslatorScaffold.emptyMetadata(content);
	}

	/**
	 * Return an empty metadata object, for occasions where there is no metadata
	 * @param content  Content, if any, that originated this empty object.
	 * @returns        An empty metadata object.
	 */
	public static emptyMetadata(content: string = ''): TranslatorMetadata {
		return {
			content,
			flow: null,
			service: null,
			hidden: true,
			thread: null,
		};
	}

	public sharedEmitter = false;

	/**
	 * A dictionary of messenger event names, eg post, into service specific events, eg inbound_message, outbound_message.
	 */
	protected abstract eventEquivalencies: EventEquivalencies;

	/**
	 * Contains methods that may be invoked by the public messageIntoEmitDetails
	 * method and will convert between service specific and communal (messenger) formats.
	 */
	protected abstract emitConverters: EmitConverters;

	/**
	 * Contains methods that may be invoked by the public
	 * responseIntoMessageResponse method and will convert
	 * between specific and generic formats.
	 */
	protected abstract responseConverters: ResponseConverters;

	protected metadataConfig: MetadataConfiguration;

	constructor(metadataConfig: MetadataConfiguration) {
		this.metadataConfig = metadataConfig;
	}

	/**
	 * Convert the provided message into details that may be passed to the emitter.
	 * @param message  Message object, in generic form, to create a payload from.
	 * @returns        Promise to provide the payload that may be passed straight to the emitter.
	 */
	public messageIntoEmitDetails(message: TransmitInformation): Promise<EmitInstructions> {
		// This searches the abstract lookup object for a match on the action desired.
		const converter = this.emitConverters[message.action];
		if (converter) {
			return converter(message);
		}
		// Rejecting if the inherited child translator has registered no suitable method.
		return Promise.reject(new TranslatorError(
			TranslatorErrorCode.EmitUnsupported,
			`${message.action} not translatable to ${message.target.service} yet.`,
		));
	}

	/**
	 * Convert the response from the emitter into a generic form
	 * @param message   The original message, only used in services where the response is incomplete
	 * @param response  The response from the emitter to convert
	 * @returns         A promise that resolves to the generic form of the response
	 */
	public responseIntoMessageResponse(
		message: TransmitInformation, response: any
	): Promise<MessengerResponse> {
		// This searches the abstract lookup object for a match on the action desired.
		const converter = this.responseConverters[message.action];
		if (converter) {
			return converter(message, response);
		}
		// Rejecting if the inherited child translator has registered no suitable method.
		return Promise.reject(new TranslatorError(
			TranslatorErrorCode.ResponseUnsupported,
			`Message action ${message.action} not translatable from ${message.target.service} yet.`,
		));
	}

	/**
	 * Find the generic name for a provided event.
	 * @param event  Event to analyse.
	 * @returns      Generic name for the event.
	 */
	public eventIntoMessageType(event: ServiceScaffoldEvent): string {
		return _.findKey(this.eventEquivalencies, (value: string[]) => {
			return _.includes(value, event.type);
		}) || 'Unrecognised event';
	}

	/**
	 * Find the specific events to listen to for a generic event type.
	 * @param type  Generic name for the event.
	 * @returns     A list of specific events to listen to.
	 */
	public messageTypeIntoEventTypes(type: string): string[] {
		return this.eventEquivalencies[type];
	}

	/**
	 * Find all the events this translator understands.
	 * @returns  The list of specific event names understood.
	 */
	public getAllEventTypes(): string[] {
		return _.flatMap(this.eventEquivalencies);
	}

	/**
	 * Promise to convert a provided service specific event into messenger's standard form.
	 * @param event  Service specific event, straight out of the ServiceListener.
	 * @returns      Promise that resolves to an array of message objects in the standard form
	 */
	public abstract eventIntoMessages(event: ServiceScaffoldEvent): Promise<MessengerEvent[]>

	/**
	 * Promise to provide emitter construction details for a provided message.
	 * @param message  Message information, used to retrieve username
	 * @returns        The details required to construct an emitter.
	 */
	public abstract messageIntoEmitterConstructor(message: TransmitInformation): ServiceScaffoldConstructor

	/**
	 * Populate the listener constructor with details from the more generic constructor.
	 * Provided since the connectionDetails might need to be parsed from JSON and the server details might be instantiated.
	 * @param connectionDetails  Construction details for the service, probably 'inert', ie from JSON.
	 * @param genericDetails     Details from the construction of the messenger.
	 * @returns                  Connection details with the value merged in.
	 */
	public abstract mergeGenericDetails(connectionDetails: object, genericDetails: MessengerConstructor): object
}
