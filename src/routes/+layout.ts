import TdClientManager from '$lib/TdClientManager';
import type { LayoutLoad } from './$lib/types';

export const ssr = false;

export const load: () => Promise<LayoutLoad> = async () => {
	const tdClientManager = await TdClientManager.getSingletonInstance();
	const client = tdClientManager.getClient();
	console.log("client: build");
	return {
		client: client,
		tdClientManager: tdClientManager
	} as LayoutLoad;
};
