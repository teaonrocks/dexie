import type { TLPageId, TLShapeId } from 'tldraw'

export type AspectRatio = '16:9'

export type Slide = {
	id: TLPageId
	title: string
	frameId?: TLShapeId
}

export type SlideSize = {
	w: number
	h: number
}

export const DEFAULT_ASPECT_RATIO: AspectRatio = '16:9'

export const SLIDE_SIZES: Record<AspectRatio, SlideSize> = {
	'16:9': { w: 1600, h: 900 },
}
