import TdClient, { type TdObject, type TdOptions } from 'tdweb';
import options from '$lib/options';
import { EncryptedStorage } from '$lib/storage/EncryptedStorage';
import { goto } from '$app/navigation';
import type { TdApi } from '$lib/types/td_api';

class TdClientManager {
	public static myInstance: TdClientManager | null = null;
	private tdClient: TdClient;
	public callback = (update: TdObject) => {
		if (update['@type'] === 'updateAuthorizationState') {
			console.log(update['@type']);
		}
	};

	private constructor() {
		const options_tg = options as TdOptions;
		options_tg.onUpdate = (update) => this.onUpdate(update);
		this.tdClient = new TdClient(options_tg);
	}

	static async getSingletonInstance(): Promise<TdClientManager> {
		if (!TdClientManager.myInstance) {
			TdClientManager.myInstance = new TdClientManager();
			console.log('New TDLib instance created.');
		} else {
			console.log('Returning existing TDLib instance.');
		}
		return TdClientManager.myInstance;
	}

	public getClient(): TdClient {
		return this.tdClient;
	}

	async onUpdate(update: TdObject) {
		this.callback(update);
		switch (update['@type']) {
			case 'updateAuthorizationState':
				await this.handleAuthorizationState(update['authorization_state'] as TdObject);
				console.log(update);
				break;
		}
	}

	async handleAuthorizationState(authState: TdObject) {
		if (authState['@type'] === 'authorizationStateWaitTdlibParameters') {
			 await this.sentTdlibParameters();
		}
		if (authState['@type'] === 'authorizationStateWaitPhoneNumber') {
			 await goto("../login",{replaceState:true});
		}
	}

	private async sentTdlibParameters() {
		const tdlibParameters: TdApi.setTdlibParameters = {
			'@type': 'setTdlibParameters',
			use_test_dc: false,
			api_id: Number.parseInt(await EncryptedStorage.loadDecrypted('api_id') || "0"),
			api_hash: (await EncryptedStorage.loadDecrypted('api_hash')) || '',
			system_language_code: navigator.language || 'en',
			device_model: 'Web Browser',
			system_version: 'web',
			application_version: '1.0.0',
			database_directory: '/tdlib',
			files_directory: "tdlib_files",
			use_file_database: true,
			use_chat_info_database: true,
			use_message_database: true,
			use_secret_chats: true
		};
		this.tdClient
			.send(tdlibParameters as TdObject)
			.then((r) => {
				console.log(r);
			});
	}

	public setCallback(callback: (update: TdObject) => void) {
		this.callback = callback;
	}
}

export default TdClientManager;
