import type TdClient from 'tdweb';
import type TdClientManager from '$lib/TdClientManager';

export interface LayoutLoad {
	client: TdClient;
	tdClientManager:TdClientManager;
}