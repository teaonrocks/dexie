import { useEffect, useMemo, useState } from 'react'
import type {
	Editor,
	SharedStyle,
	StyleProp,
	TLDefaultColorStyle,
	TLDefaultDashStyle,
	TLDefaultFillStyle,
	TLDefaultFontStyle,
	TLDefaultSizeStyle,
} from 'tldraw'
import {
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
	DefaultFontStyle,
	DefaultSizeStyle,
} from 'tldraw'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarSeparator,
} from '@/components/ui/sidebar'
import { ColorPicker, type ColorOption } from '@/components/ui/color-picker'

type CanvasPropertiesSidebarProps = {
	editor: Editor | null
	enabled: boolean
}

const STYLE_COLOR_OPTIONS: ColorOption<TLDefaultColorStyle>[] = [
	{ value: 'black', label: 'Black', hex: '#1F1F1F' },
	{ value: 'grey', label: 'Grey', hex: '#8C8C8C' },
	{ value: 'light-violet', label: 'Light Violet', hex: '#C5A4FF' },
	{ value: 'violet', label: 'Violet', hex: '#7A4DFF' },
	{ value: 'blue', label: 'Blue', hex: '#2D70FF' },
	{ value: 'light-blue', label: 'Light Blue', hex: '#4CB5FF' },
	{ value: 'yellow', label: 'Yellow', hex: '#F9D94A' },
	{ value: 'orange', label: 'Orange', hex: '#FF9D48' },
	{ value: 'green', label: 'Green', hex: '#32A852' },
	{ value: 'light-green', label: 'Light Green', hex: '#7ED957' },
	{ value: 'light-red', label: 'Light Red', hex: '#FF7C7C' },
	{ value: 'red', label: 'Red', hex: '#FF4D4F' },
]

const STYLE_FILL_OPTIONS: TLDefaultFillStyle[] = ['none', 'semi', 'solid', 'pattern']
const STYLE_DASH_OPTIONS: TLDefaultDashStyle[] = ['draw', 'dashed', 'dotted', 'solid']
const STYLE_SIZE_OPTIONS: TLDefaultSizeStyle[] = ['s', 'm', 'l', 'xl']
const STYLE_FONT_OPTIONS: TLDefaultFontStyle[] = ['draw', 'sans', 'serif', 'mono']
const OPACITY_STOPS = [0.1, 0.25, 0.5, 0.75, 1] as const

const SELECT_MIXED_VALUE = '__mixed'
const SELECT_UNSET_VALUE = '__unset'

export function CanvasPropertiesSidebar({ editor, enabled }: CanvasPropertiesSidebarProps) {
	const [version, setVersion] = useState(0)

	useEffect(() => {
		if (!editor) return
		return editor.store.listen(() => setVersion((current) => current + 1))
	}, [editor])

	const relevantStyles = useMemo(() => {
		if (!editor) return null

		const styles = editor.getSharedStyles()
		const selectedShapeIds = editor.getSelectedShapeIds()
		const hasShapesSelected = editor.isIn('select') && selectedShapeIds.length > 0
		const isInShapeSpecificTool = !!editor.root.getCurrent()?.shapeType

		if (isInShapeSpecificTool || hasShapesSelected || styles.size > 0) {
			return styles
		}

		return null
	}, [editor, version])

	const opacity = useMemo(() => {
		if (!editor) return undefined
		return editor.getSharedOpacity()
	}, [editor, version])

	const selectedCount = editor?.getSelectedShapeIds().length ?? 0

	if (!enabled) return null

	const applyStyleValue = <T extends string>(style: StyleProp<T>, value: T) => {
		if (!editor) return

		editor.run(() => {
			if (editor.isIn('select')) {
				editor.setStyleForSelectedShapes(style, value)
			}
			editor.setStyleForNextShapes(style, value)
			editor.updateInstanceState({ isChangingStyle: true })
		})
	}

	const applyOpacity = (value: number) => {
		if (!editor) return

		editor.run(() => {
			if (editor.isIn('select')) {
				editor.setOpacityForSelectedShapes(value)
			}
			editor.setOpacityForNextShapes(value)
			editor.updateInstanceState({ isChangingStyle: true })
		})
	}

	const color = resolveStyle(DefaultColorStyle)
	const fill = resolveStyle(DefaultFillStyle)
	const dash = resolveStyle(DefaultDashStyle)
	const size = resolveStyle(DefaultSizeStyle)
	const font = resolveStyle(DefaultFontStyle)

	function resolveStyle<T extends string>(style: StyleProp<T>): SharedStyle<T> | undefined {
		const shared = relevantStyles?.get(style)
		if (shared) return shared
		if (!editor || selectedCount > 0 || !editor.isIn('select')) return undefined
		return { type: 'shared', value: editor.getStyleForNextShape(style) }
	}

	return (
		<Sidebar side="right" collapsible="none" className="border-l">
			<SidebarHeader className="px-3 py-3">
				<div className="flex flex-col gap-1">
					<h2 className="text-sm font-semibold">Properties</h2>
					<p className="text-xs text-muted-foreground">
						{selectedCount > 0
							? `${selectedCount} selected`
							: 'No selection, editing defaults for next shape'}
					</p>
				</div>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup className="space-y-3 p-3">
					{color !== undefined ? (
						<ColorPicker
							label="Color"
							options={STYLE_COLOR_OPTIONS}
							value={color.type === 'shared' ? color.value : undefined}
							statusText={color.type === 'mixed' ? 'Mixed values' : undefined}
							onChange={(value) => applyStyleValue(DefaultColorStyle, value)}
						/>
					) : null}
					<StyleSelect
						label="Fill"
						styleValue={fill}
						options={STYLE_FILL_OPTIONS}
						onChange={(value) => applyStyleValue(DefaultFillStyle, value)}
					/>
					<StyleSelect
						label="Dash"
						styleValue={dash}
						options={STYLE_DASH_OPTIONS}
						onChange={(value) => applyStyleValue(DefaultDashStyle, value)}
					/>
					<StyleSelect
						label="Size"
						styleValue={size}
						options={STYLE_SIZE_OPTIONS}
						onChange={(value) => applyStyleValue(DefaultSizeStyle, value)}
					/>
					<StyleSelect
						label="Font"
						styleValue={font}
						options={STYLE_FONT_OPTIONS}
						onChange={(value) => applyStyleValue(DefaultFontStyle, value)}
					/>
					<OpacitySlider opacity={opacity} onChange={applyOpacity} />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}

type StyleSelectProps<T extends string> = {
	label: string
	styleValue: SharedStyle<T> | undefined
	options: readonly T[]
	onChange: (value: T) => void
}

function StyleSelect<T extends string>({ label, styleValue, options, onChange }: StyleSelectProps<T>) {
	if (!styleValue) return null

	const value =
		styleValue.type === 'shared'
			? styleValue.value
			: styleValue.type === 'mixed'
				? SELECT_MIXED_VALUE
				: SELECT_UNSET_VALUE

	return (
		<label className="flex flex-col gap-1 text-xs">
			<span className="font-medium text-foreground">{label}</span>
			<select
				className="h-8 rounded-md border bg-background px-2 text-sm"
				value={value}
				onChange={(event) => onChange(event.target.value as T)}
			>
				<option value={SELECT_UNSET_VALUE} disabled>
					Not available
				</option>
				<option value={SELECT_MIXED_VALUE} disabled>
					Mixed values
				</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	)
}

type OpacitySliderProps = {
	opacity: SharedStyle<number> | undefined
	onChange: (value: number) => void
}

function OpacitySlider({ opacity, onChange }: OpacitySliderProps) {
	if (!opacity) return null

	const sliderIndex =
		opacity.type === 'shared'
			? nearestOpacityIndex(opacity.value)
			: OPACITY_STOPS.length - 1

	return (
		<label className="flex flex-col gap-1 text-xs">
			<span className="font-medium text-foreground">Opacity</span>
			<input
				type="range"
				min={0}
				max={OPACITY_STOPS.length - 1}
				step={1}
				value={sliderIndex}
				onChange={(event) => {
					const next = OPACITY_STOPS[Number(event.target.value)] ?? OPACITY_STOPS[OPACITY_STOPS.length - 1]
					onChange(next)
				}}
			/>
			<span className="text-muted-foreground">
				{opacity.type === 'mixed' ? 'Mixed values' : `${Math.round(opacity.value * 100)}%`}
			</span>
		</label>
	)
}

function nearestOpacityIndex(value: number) {
	return OPACITY_STOPS.reduce((bestIndex, candidate, candidateIndex) => {
		const bestDistance = Math.abs(OPACITY_STOPS[bestIndex] - value)
		const nextDistance = Math.abs(candidate - value)
		return nextDistance < bestDistance ? candidateIndex : bestIndex
	}, 0)
}
