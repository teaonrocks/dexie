import { useEffect, useMemo, useRef, useState } from 'react'
import type { Editor, TLPageId } from 'tldraw'
import { Tldraw } from 'tldraw'
import { SlidesSidebar } from './components/SlidesSidebar'
import { DEFAULT_ASPECT_RATIO, SLIDE_SIZES, type Slide } from './slides/slideModel'
import {
	createSlide,
	deleteSlidePage,
	duplicateSlide,
	ensureSlideFrame,
	fitSlideFrame,
	renameSlidePage,
} from './slides/slideOps'

function App() {
	const [editor, setEditor] = useState<Editor | null>(null)
	const [slides, setSlides] = useState<Slide[]>([])
	const [currentSlideId, setCurrentSlideId] = useState<TLPageId | null>(null)
	const hasInitialized = useRef(false)
	const slideSize = useMemo(() => SLIDE_SIZES[DEFAULT_ASPECT_RATIO], [])

	useEffect(() => {
		if (!editor || hasInitialized.current) return

		const initialPageId = editor.getCurrentPageId()
		const initialSlide: Slide = {
			id: initialPageId,
			title: 'Slide 1',
		}

		ensureSlideFrame(editor, initialPageId, slideSize, initialSlide.title)
		fitSlideFrame(editor)

		setSlides([initialSlide])
		setCurrentSlideId(initialPageId)
		hasInitialized.current = true
	}, [editor, slideSize])

	useEffect(() => {
		if (!editor || !currentSlideId) return
		if (editor.getCurrentPageId() !== currentSlideId) {
			editor.setCurrentPage(currentSlideId)
		}
		ensureSlideFrame(editor, currentSlideId, slideSize)
		fitSlideFrame(editor)
	}, [editor, currentSlideId, slideSize])

	const handleAddSlide = () => {
		if (!editor) return
		const title = `Slide ${slides.length + 1}`
		const result = createSlide(editor, title, slideSize)
		const nextSlide: Slide = { id: result.pageId, title }
		setSlides((prev) => [...prev, nextSlide])
		setCurrentSlideId(result.pageId)
	}

	const handleSelectSlide = (id: TLPageId) => {
		setCurrentSlideId(id)
	}

	const handleRenameSlide = (id: TLPageId, title: string) => {
		if (!editor) return
		renameSlidePage(editor, id, title)
		setSlides((prev) => prev.map((slide) => (slide.id === id ? { ...slide, title } : slide)))
	}

	const handleDuplicateSlide = (id: TLPageId) => {
		if (!editor) return
		const sourceSlide = slides.find((slide) => slide.id === id)
		if (!sourceSlide) return
		const title = `${sourceSlide.title} Copy`
		const result = duplicateSlide(editor, id, title, slideSize)
		const nextSlide: Slide = { id: result.pageId, title }
		const sourceIndex = slides.findIndex((slide) => slide.id === id)

		setSlides((prev) => {
			const next = [...prev]
			next.splice(sourceIndex + 1, 0, nextSlide)
			return next
		})
		setCurrentSlideId(result.pageId)
	}

	const handleDeleteSlide = (id: TLPageId) => {
		if (!editor) return
		if (slides.length <= 1) return
		const currentIndex = slides.findIndex((slide) => slide.id === id)
		const nextSlide = slides[currentIndex - 1] ?? slides[currentIndex + 1]
		deleteSlidePage(editor, id)
		setSlides((prev) => prev.filter((slide) => slide.id !== id))
		setCurrentSlideId(nextSlide?.id ?? null)
	}

	const handleMoveSlide = (id: TLPageId, direction: 'up' | 'down') => {
		setSlides((prev) => {
			const index = prev.findIndex((slide) => slide.id === id)
			if (index < 0) return prev
			const nextIndex = direction === 'up' ? index - 1 : index + 1
			if (nextIndex < 0 || nextIndex >= prev.length) return prev
			const next = [...prev]
			const [moved] = next.splice(index, 1)
			next.splice(nextIndex, 0, moved)
			return next
		})
	}

	return (
		<div className="flex h-full w-full overflow-hidden">
			<SlidesSidebar
				slides={slides}
				currentSlideId={currentSlideId}
				onAdd={handleAddSlide}
				onSelect={handleSelectSlide}
				onRename={handleRenameSlide}
				onDuplicate={handleDuplicateSlide}
				onDelete={handleDeleteSlide}
				onMove={handleMoveSlide}
			/>
			<div className="relative min-w-0 flex-1">
				<Tldraw onMount={setEditor} />
			</div>
		</div>
	)
}

export default App
