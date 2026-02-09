import type { Editor, TLPageId, TLShape, TLShapeId, TLShapePartial } from 'tldraw'
import { PageRecordType, createShapeId } from 'tldraw'
import type { SlideSize } from './slideModel'

const FRAME_TYPE = 'frame'

export type SlideCreateResult = {
	pageId: TLPageId
	frameId: TLShapeId
}

export function getSlideFrame(editor: Editor): TLShape | null {
	const frame = editor.getCurrentPageShapes().find((shape) => shape.type === FRAME_TYPE)
	return frame ?? null
}

export function ensureSlideFrame(
	editor: Editor,
	pageId: TLPageId,
	size: SlideSize,
	title = 'Slide'
): TLShapeId {
	if (editor.getCurrentPageId() !== pageId) {
		editor.setCurrentPage(pageId)
	}

	let frame = getSlideFrame(editor)
	if (!frame) {
		const frameId = createShapeId()
		editor.createShape({
			id: frameId,
			type: FRAME_TYPE,
			x: 0,
			y: 0,
			props: { w: size.w, h: size.h, name: title },
		})
		editor.updateShape({ id: frameId, type: FRAME_TYPE, isLocked: true })
		frame = editor.getShape(frameId) ?? null
	}

	if (frame && !frame.isLocked) {
		editor.updateShape({ id: frame.id, type: FRAME_TYPE, isLocked: true })
	}

	return frame?.id ?? createShapeId()
}

export function fitSlideFrame(editor: Editor) {
	const frame = getSlideFrame(editor)
	if (!frame) return
	const bounds = editor.getShapePageBounds(frame)
	if (!bounds) return
	editor.zoomToBounds(bounds, { targetZoom: 1, immediate: true })
}

export function createSlide(editor: Editor, title: string, size: SlideSize): SlideCreateResult {
	const pageId = PageRecordType.createId()
	editor.createPage({ id: pageId, name: title })
	editor.setCurrentPage(pageId)
	const frameId = ensureSlideFrame(editor, pageId, size, title)
	return { pageId, frameId }
}

export function duplicateSlide(
	editor: Editor,
	sourcePageId: TLPageId,
	title: string,
	size: SlideSize
): SlideCreateResult {
	const previousPageId = editor.getCurrentPageId()
	editor.setCurrentPage(sourcePageId)

	const sourceShapes = editor.getCurrentPageShapes()
	const sourceFrame = sourceShapes.find((shape) => shape.type === FRAME_TYPE) ?? null

	const pageId = PageRecordType.createId()
	editor.createPage({ id: pageId, name: title })
	editor.setCurrentPage(pageId)

	const frameId = ensureSlideFrame(editor, pageId, size, title)

	const shapesToCopy = sourceShapes.filter((shape) => shape.id !== sourceFrame?.id)
	const idMap = new Map<TLShapeId, TLShapeId>()
	for (const shape of shapesToCopy) {
		idMap.set(shape.id, createShapeId())
	}

	const partials = shapesToCopy.map((shape) => {
		const newId = idMap.get(shape.id)!
		let parentId: TLShapeId | undefined

		if (sourceFrame && shape.parentId === sourceFrame.id) {
			parentId = frameId
		} else if (idMap.has(shape.parentId as TLShapeId)) {
			parentId = idMap.get(shape.parentId as TLShapeId)
		}

		return {
			id: newId,
			type: shape.type,
			x: shape.x,
			y: shape.y,
			rotation: shape.rotation,
			props: shape.props,
			isLocked: shape.isLocked,
			parentId,
		} as TLShapePartial
	})

	if (partials.length > 0) {
		editor.createShapes(partials)
	}

	editor.setCurrentPage(pageId)

	if (previousPageId !== pageId) {
		editor.setCurrentPage(pageId)
	}

	return { pageId, frameId }
}

export function deleteSlidePage(editor: Editor, pageId: TLPageId) {
	editor.deletePage(pageId)
}

export function renameSlidePage(editor: Editor, pageId: TLPageId, title: string) {
	editor.renamePage(pageId, title || 'Slide')
}
