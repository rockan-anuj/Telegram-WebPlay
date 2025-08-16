import type { TdApi } from '$lib/types/td_api';
import TdClient, { type TdObject } from 'tdweb';
import type TdClientManager from '$lib/TdClientManager';
import { DownloadedParts } from '$lib/utils/DownloadedParts';

export class PlayerUtils {
	client: TdClient;
	msg: TdApi.message | undefined;
	private clientManager: TdClientManager;
	private chunkSize: number = 100000;
	private reqNumber: number = 1;
	private dParts = new DownloadedParts();

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
		this.dParts = new DownloadedParts();
	}

	async getFileChunkOfVideo(offset: number, length: number) {
		length = Math.min(this.chunkSize*this.reqNumber,10000000);
		const msgDoc = this.msg?.content as TdApi.messageDocument;
		const arrayBuffer = await this.readFilePart(msgDoc.document.document.id, offset, length);
		console.log(arrayBuffer.byteLength + ' bytes sent');
		return arrayBuffer;
	}

	private async readFilePart(file_id: number, offset: number, count: number) {
		console.log('downloading for ', offset, count);

		if(offset < 100000){
			await this.client.send({
				'@type': 'setNetworkType',
				type: {
					'@type': 'networkTypeWiFi'
				} as TdApi.networkTypeWiFi
			} as TdApi.setNetworkType as TdObject);
		}

		if(!this.dParts.checkPart(offset,offset+count)){
			await this.client.send({
				'@type': 'downloadFile',
				file_id: file_id,
				priority: 30,
				offset: offset,
				limit: count,
				synchronous: true
			} as TdApi.downloadFile as TdObject);
			this.dParts.addPart(offset,offset+count);
		}else{
			console.log('already downloaded for ', offset, offset+count);
		}

		const r = await this.client.send({
			'@type': 'readFilePart',
			file_id: file_id,
			offset: offset,
			count: count
		} as TdApi.readFilePart as TdObject);
		const filePart = r as unknown as TdApi.filePart;
		console.log(file_id, offset, count, filePart.data.size);
		this.reqNumber *= 2;
		return await filePart.data.arrayBuffer();
	}

	setChunkSize(chunkSize: number) {
		this.chunkSize = Math.max(chunkSize, 100000);
	}
}
