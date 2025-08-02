import type { TdApi } from '$lib/types/td_api';
import TdClient, { type TdObject } from 'tdweb';
import shaka from 'shaka-player';

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

		const blob = new Blob([await readFilePart(file.id,0,10000000)], { type: "video/mp4" });

		const objectURL = URL.createObjectURL(blob);

		// Assign to <video>
		this.videoElem.src = objectURL;
		this.videoElem.play();

		// Optional: Cleanup when video ends
		this.videoElem.onended = () => {
			URL.revokeObjectURL(objectURL);
		};

		async function readFilePart(file_id: number, offset: number, count: number) {
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

		function downloadUint8Array(data: Blob, filename: string) {
			const url = URL.createObjectURL(data);

			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();

			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	}
}
