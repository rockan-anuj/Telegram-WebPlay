export class DownloadedParts {
	private parts: { start: number, end: number }[] = [];

	addPart(offset: number, size: number) {
		const start = offset;
		const end = offset + size; // non-inclusive
		this.parts.push({ start, end });
		this.mergeParts();
	}

	checkPart(offset: number, size: number): boolean {
		const start = offset;
		const end = offset + size;

		for (const part of this.parts) {
			if (start >= part.start && end <= part.end) {
				return true;
			}
		}
		return false;
	}

	private mergeParts() {
		if (this.parts.length <= 1) return;

		this.parts.sort((a, b) => a.start - b.start);

		const merged: { start: number, end: number }[] = [];
		let current = this.parts[0];

		for (let i = 1; i < this.parts.length; i++) {
			const next = this.parts[i];

			if (next.start <= current.end) {
				// Overlap → extend
				current.end = Math.max(current.end, next.end);
			} else {
				merged.push(current);
				current = next;
			}
		}

		merged.push(current);
		this.parts = merged;
	}
}
