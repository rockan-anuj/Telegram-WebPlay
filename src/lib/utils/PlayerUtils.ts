import type { TdApi } from '$lib/types/td_api';
import TdClient, { type TdObject } from 'tdweb';

export class PlayerUtils {
	videoElem: HTMLVideoElement;

	constructor(videoElem: HTMLVideoElement) {
		this.videoElem = videoElem;
	}

	async playDocumentVideo(client: TdClient, msg: TdApi.message, videoElem: HTMLVideoElement) {
		this.videoElem = videoElem;
		msg = (await client.send({
			'@type': 'getMessage',
			chat_id: msg.chat_id,
			message_id: msg.id
		} as TdApi.getMessage as TdObject)) as unknown as TdApi.message;
		const msgDoc = msg.content as TdApi.messageDocument;
		const mime_type = msgDoc.document.mime_type;
		await this.readFileAndSetInPlayer(client, mime_type, msgDoc.document.document);
	}

	async readFileAndSetInPlayer(client: TdClient, mime_type: string, file: TdApi.file) {
		const mediaSource = new MediaSource();
		console.log("Creating MediaSource");

		this.videoElem.src = URL.createObjectURL(mediaSource);
		console.log("Set video src");

		this.videoElem.addEventListener("error", (e) => {
			console.error("Video element error:", e, this.videoElem.error);
		});

		async function readFilePart(file_id: number, offset: number, count: number) {
			console.log("downloading for ", offset, count);
			await client.send({
				'@type': 'downloadFile',
				file_id: file_id,
				priority: 32,
				offset: offset,
				limit: count,
				synchronous: true
			} as TdApi.downloadFile as TdObject);
			const r = await client.send({
				'@type': 'readFilePart',
				file_id: file_id,
				offset: offset,
				count: count
			} as TdApi.readFilePart as TdObject);
			const filePart = r as unknown as TdApi.filePart;
			console.log(file_id, offset, count, filePart.data.size);
			return new Uint8Array(await filePart.data.arrayBuffer());
		}
	}
}
