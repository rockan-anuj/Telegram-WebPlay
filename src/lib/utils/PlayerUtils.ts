import type { TdApi } from '$lib/types/td_api';
import TdClient, { type TdObject } from 'tdweb';
import type TdClientManager from '$lib/TdClientManager';

export class PlayerUtils {
	client: TdClient;
	msg: TdApi.message | undefined;
	private clientManager: TdClientManager;

	constructor(clientManager: TdClientManager, msg: TdApi.message) {
		this.clientManager = clientManager;
		this.client = clientManager.getClient();
		this.client
			.send({
				'@type': 'getMessage',
				chat_id: msg.chat_id,
				message_id: msg.id
			} as TdApi.getMessage as TdObject)
			.then((r) => {
				if (r['@type'] === 'message') {
					this.msg = r as unknown as TdApi.message;
					console.log('player utils created with ' + this.msg);
				}
			});
	}

	async getFileChunkOfVideo(offset: number, length: number) {
		const msgDoc = this.msg?.content as TdApi.messageDocument;
		const arrayBuffer = await this.readFilePart(msgDoc.document.document.id, offset, length);
		console.log(arrayBuffer.byteLength + ' bytes sent');
		return arrayBuffer;
	}

	private async readFilePart(file_id: number, offset: number, count: number) {
		console.log('downloading for ', offset, count);

		if(offset === 0){
			await this.client.send({
				'@type': 'setNetworkType',
				type: {
					'@type': 'networkTypeWiFi'
				} as TdApi.networkTypeWiFi
			} as TdApi.setNetworkType as TdObject);
		}

		await this.client.send({
			'@type': 'downloadFile',
			file_id: file_id,
			priority: 1,
			offset: offset,
			limit: count,
			synchronous: true
		} as TdApi.downloadFile as TdObject);

		const r = await this.client.send({
			'@type': 'readFilePart',
			file_id: file_id,
			offset: offset,
			count: count
		} as TdApi.readFilePart as TdObject);
		const filePart = r as unknown as TdApi.filePart;
		console.log(file_id, offset, count, filePart.data.size);
		return await filePart.data.arrayBuffer();
	}

	private setCallBack() {
		this.clientManager.setCallback((update) => {
			if (update['@type'] === 'updateFile') {
				console.log(update);
				const updateFile = (update as unknown as TdApi.updateFile).file;
				if (updateFile.local.is_downloading_active) {
					console.log('Download prog:', updateFile.local.path, updateFile.local.downloaded_size);
				} else if (
					!updateFile.local.is_downloading_active &&
					updateFile.local.downloaded_size > 100
				) {
					console.log('Download completed:', updateFile.local.path);
				}
			}
		});
	}
}
