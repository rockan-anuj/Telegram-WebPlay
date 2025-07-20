export class EncryptedStorage {
	private static encoder = new TextEncoder();
	private static decoder = new TextDecoder();

	private static password = '318e12893712e98';

	private static async getKey(): Promise<CryptoKey> {
		const passwordKey = await crypto.subtle.importKey(
			'raw',
			this.encoder.encode(this.password),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);

		return crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: this.encoder.encode('static_salt'), // Use unique salt in production
				iterations: 100000,
				hash: 'SHA-256',
			},
			passwordKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	}

	private static async encrypt(data: string): Promise<string> {
		const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
		const key = await this.getKey();
		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv },
			key,
			this.encoder.encode(data)
		);

		// Store IV + encrypted data (Base64)
		const combined = new Uint8Array(iv.length + encrypted.byteLength);
		combined.set(iv, 0);
		combined.set(new Uint8Array(encrypted), iv.length);

		return btoa(String.fromCharCode(...combined));
	}

	private static async decrypt(data: string): Promise<string> {
		const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
		const iv = combined.slice(0, 12);
		const encryptedData = combined.slice(12);

		const key = await this.getKey();
		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv },
			key,
			encryptedData
		);

		return this.decoder.decode(decrypted);
	}

	static async saveEncrypted(key: string, value: string) {
		const encrypted = await this.encrypt(value);
		localStorage.setItem(key, encrypted);
	}

	static async loadDecrypted(key: string): Promise<string | null> {
		const val = localStorage.getItem(key);
		if (!val) return null;
		try {
			return await this.decrypt(val);
		} catch (e) {
			console.error('Decryption failed', e);
			return null;
		}
	}
}
