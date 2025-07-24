import type { TdApi } from '$lib/types/td_api';

export class TelegramUtils {
	static getTagFromMsg(message: TdApi.message): string {
		if (message.content['@type'] === 'messageText') {
			const messageText = message.content as TdApi.messageText;
			return messageText.text.text;
		}
		if (message.content['@type'] === 'messagePhoto') {
			const messagePhoto = message.content as TdApi.messagePhoto;
			return messagePhoto.caption.text;
		}
		if (message.content['@type'] === 'messageAudio') {
			const messageAudio = message.content as TdApi.messageAudio;
			return messageAudio.caption.text;
		}
		if (message.content['@type'] === 'messageDocument') {
			const messageDocument = message.content as TdApi.messageDocument;
			return messageDocument.caption.text;
		}
		if (message.content['@type'] === 'messageVideo') {
			const messageVideo = message.content as TdApi.messageVideo;
			return messageVideo.caption.text;
		}
		if (message.content['@type'] === 'messageAnimation') {
			const messageAnimation = message.content as TdApi.messageAnimation;
			return messageAnimation.caption.text;
		}
		if (message.content['@type'] === 'messageAnimatedEmoji') {
			// No return value in original Java for this case, so it will fall through to ''
		}
		if (message.content['@type'] === 'messageContact') {
			const messageContact = message.content as TdApi.messageContact;
			return messageContact.contact.first_name + ' ' + messageContact.contact.last_name;
		}
		if (message.content['@type'] === 'messageLocation') {
			// No return value in original Java for this case, so it will fall through to ''
		}
		if (message.content['@type'] === 'messageVenue') {
			// No return value in original Java for this case, so it will fall through to ''
		}
		if (message.content['@type'] === 'messageBasicGroupChatCreate') {
			const messageBasicGroupChatCreate = message.content as TdApi.messageBasicGroupChatCreate;
			return messageBasicGroupChatCreate.title;
		}
		if (message.content['@type'] === 'messageChatAddMembers') {
			const messageChatAddMembers = message.content as TdApi.messageChatAddMembers;
			return String(messageChatAddMembers);
		}
		if (message.content['@type'] === 'messageChatJoinByLink') {
			const messageChatJoinByLink = message.content as TdApi.messageChatJoinByLink;
			return String(messageChatJoinByLink);
		}
		if (message.content['@type'] === 'messageChatDeleteMember') {
			const messageChatDeleteMember = message.content as TdApi.messageChatDeleteMember;
			return String(messageChatDeleteMember);
		}
		return '';
	}

	static formatMessageTime(unixSeconds: number): string {
		if (unixSeconds === 0) {
			return "Scheduled";
		}

		const messageDate = new Date(unixSeconds * 1000);

		const now = new Date();
		const yesterday = new Date();
		yesterday.setDate(now.getDate() - 1);

		if (TelegramUtils.isSameDay(now, messageDate)) {
			return new Intl.DateTimeFormat(undefined, {
				hour: 'numeric',
				minute: 'numeric',
				hour12: true
			}).format(messageDate);
		}

		if (TelegramUtils.isSameDay(yesterday, messageDate)) {
			return "Yesterday";
		}

		return new Intl.DateTimeFormat(undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(messageDate);
	}

	private static isSameDay(date1: Date, date2: Date): boolean {
		return date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate();
	}

	static getTimeFromMsg(message: TdApi.Message): string {
		return TelegramUtils.formatMessageTime(message.date);
	}
}

export interface OrderedChat {
	order: string;
	chatItem: TdApi.Chat;
}