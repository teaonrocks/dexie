import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ColorOption<T extends string = string> = {
	value: T;
	label: string;
	hex: string;
};

type ColorPickerProps<T extends string = string> = {
	label?: string;
	value?: T;
	options: readonly ColorOption<T>[];
	onChange: (value: T) => void;
	statusText?: string;
};

export function ColorPicker<T extends string>({
	label = "Color",
	value,
	options,
	onChange,
	statusText,
}: ColorPickerProps<T>) {
	const selected = useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	);
	const [hexInput, setHexInput] = useState(selected?.hex ?? "");

	useEffect(() => {
		setHexInput(selected?.hex ?? "");
	}, [selected?.hex]);

	const applyHex = () => {
		const normalized = normalizeHex(hexInput);
		if (!normalized) return;
		const closest = getClosestColorOption(normalized, options);
		if (!closest) return;
		onChange(closest.value);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium text-foreground">{label}</span>
				{statusText ? (
					<span className="text-xs text-muted-foreground">{statusText}</span>
				) : null}
			</div>

			<div className="grid grid-cols-6 gap-2">
				{options.map((option) => {
					const isSelected = option.value === value;
					return (
						<Button
							key={option.value}
							type="button"
							size="icon-xs"
							variant={isSelected ? "secondary" : "outline"}
							className={cn(
								"relative border p-0",
								isSelected &&
									"ring-2 ring-ring ring-offset-1 ring-offset-background",
							)}
							aria-label={`Pick ${option.label}`}
							aria-pressed={isSelected}
							onClick={() => onChange(option.value)}
							title={option.label}
						>
							<span
								className="size-4 rounded-sm border border-black/10"
								style={{ backgroundColor: option.hex }}
							/>
							{isSelected ? (
								<span className="absolute -top-1 -right-1 inline-flex size-3.5 items-center justify-center rounded-full border bg-background text-[10px] leading-none">
									✓
								</span>
							) : null}
						</Button>
					);
				})}
			</div>

			{/* <div className="flex items-center gap-2">
				<Input
					value={hexInput}
					onChange={(event) => setHexInput(event.target.value)}
					onBlur={applyHex}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault()
							applyHex()
						}
					}}
					placeholder="#000000"
					maxLength={7}
					className="h-8"
					aria-label={`${label} hex value`}
				/>
				<div
					className="size-8 rounded-md border"
					style={{ backgroundColor: normalizeHex(hexInput) ?? selected?.hex ?? '#ffffff' }}
					aria-hidden
				/>
			</div> */}
		</div>
	);
}

function normalizeHex(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
	if (!/^#[0-9a-fA-F]{6}$/.test(prefixed)) return null;
	return prefixed.toUpperCase();
}

function getClosestColorOption<T extends string>(
	hex: string,
	options: readonly ColorOption<T>[],
): ColorOption<T> | undefined {
	const targetRgb = hexToRgb(hex);
	if (!targetRgb) return undefined;

	return options.reduce<ColorOption<T> | undefined>((best, candidate) => {
		const candidateRgb = hexToRgb(candidate.hex);
		if (!candidateRgb) return best;
		if (!best) return candidate;

		const bestRgb = hexToRgb(best.hex);
		if (!bestRgb) return candidate;

		const bestDistance = colorDistance(targetRgb, bestRgb);
		const nextDistance = colorDistance(targetRgb, candidateRgb);
		return nextDistance < bestDistance ? candidate : best;
	}, undefined);
}

function hexToRgb(hex: string) {
	const normalized = normalizeHex(hex);
	if (!normalized) return null;

	const value = normalized.slice(1);
	return {
		r: parseInt(value.slice(0, 2), 16),
		g: parseInt(value.slice(2, 4), 16),
		b: parseInt(value.slice(4, 6), 16),
	};
}

function colorDistance(
	a: { r: number; g: number; b: number },
	b: { r: number; g: number; b: number },
) {
	return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}
