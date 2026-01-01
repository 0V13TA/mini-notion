export type BlockType = {
	id: string;
	type: 'paragraph' | 'heading' | 'list' | 'todo';
	content: string;
	properties?: {
		// List type for list blocks
		listType?: 'bullet' | 'roman' | 'numbered';
		index?: number;

		// Todo checked status for todo blocks
		checked?: boolean;

		// Heading level from 1 to 6
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
	};
};

export type PageData = {
	id: string;
	title: string;
	icon: string | null;
	content: BlockType[]; // The array of blocks
	userId: string;
	isFavorite: boolean;
	createdAt: string;
	updatedAt: string;
};
