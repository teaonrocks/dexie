import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import type { TLPageId } from "tldraw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Slide } from "../slides/slideModel";

type SlidesSidebarProps = {
	slides: Slide[];
	currentSlideId: TLPageId | null;
	onSelect: (id: TLPageId) => void;
	onAdd: () => void;
	onDuplicate: (id: TLPageId) => void;
	onDelete: (id: TLPageId) => void;
	onRename: (id: TLPageId, title: string) => void;
	onMove: (id: TLPageId, direction: "up" | "down") => void;
};

export function SlidesSidebar({
	slides,
	currentSlideId,
	onSelect,
	onAdd,
	onDuplicate,
	onDelete,
	onRename,
	onMove,
}: SlidesSidebarProps) {
	const [editingId, setEditingId] = useState<TLPageId | null>(null);
	const [draftTitle, setDraftTitle] = useState("");

	const currentIndex = useMemo(() => {
		if (!currentSlideId) return -1;
		return slides.findIndex((slide) => slide.id === currentSlideId);
	}, [currentSlideId, slides]);

	const startEditing = (slide: Slide) => {
		setEditingId(slide.id);
		setDraftTitle(slide.title);
	};

	const commitEditing = (slide: Slide) => {
		const nextTitle = draftTitle.trim() || "Slide";
		onRename(slide.id, nextTitle);
		setEditingId(null);
		setDraftTitle("");
	};

	const cancelEditing = () => {
		setEditingId(null);
		setDraftTitle("");
	};

	return (
		<aside className="flex h-full w-72 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
			<div className="flex items-center justify-between gap-2 p-3">
				<h2 className="text-sm font-semibold tracking-tight">Slides</h2>
				<Button size="sm" onClick={onAdd}>
					<Plus className="size-4" />
					Add
				</Button>
			</div>

			<Separator />

			<ScrollArea className="min-h-0 flex-1">
				<div className="flex flex-col gap-2 p-3">
					{slides.map((slide, index) => {
						const isActive = slide.id === currentSlideId;
						const isEditing = slide.id === editingId;

						return (
							<div
								key={slide.id}
								className={cn(
									"rounded-lg border bg-card p-2 text-card-foreground shadow-sm transition-colors",
									isActive
										? "ring-2 ring-ring ring-offset-2 ring-offset-background"
										: "hover:bg-accent/40"
								)}
							>
								<div className="flex items-center gap-2">
									<span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
										{index + 1}
									</span>

									{isEditing ? (
										<Input
											value={draftTitle}
											autoFocus
											onChange={(event) => setDraftTitle(event.target.value)}
											onBlur={() => commitEditing(slide)}
											onKeyDown={(event) => {
												if (event.key === "Enter") commitEditing(slide);
												if (event.key === "Escape") cancelEditing();
											}}
											className="h-7 min-w-0 flex-1 px-2 text-sm"
										/>
									) : (
										<button
											type="button"
											onClick={() => onSelect(slide.id)}
											onDoubleClick={() => startEditing(slide)}
											className="min-w-0 flex-1 truncate rounded-md px-1 py-0.5 text-left text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
										>
											{slide.title}
										</button>
									)}
								</div>

								<div className="mt-2 flex flex-wrap gap-1">
									<Button
										variant="ghost"
										size="icon-xs"
										onClick={() => onMove(slide.id, "up")}
										disabled={index === 0}
										aria-label="Move slide up"
									>
										<ChevronUp />
									</Button>
									<Button
										variant="ghost"
										size="icon-xs"
										onClick={() => onMove(slide.id, "down")}
										disabled={index === slides.length - 1}
										aria-label="Move slide down"
									>
										<ChevronDown />
									</Button>
									<Button
										variant="ghost"
										size="icon-xs"
										onClick={() => onDuplicate(slide.id)}
										aria-label="Duplicate slide"
									>
										<Copy />
									</Button>
									<Button
										variant="ghost"
										size="icon-xs"
										onClick={() => onDelete(slide.id)}
										disabled={slides.length === 1}
										aria-label="Delete slide"
										className="text-destructive hover:text-destructive"
									>
										<Trash2 />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>

			{currentIndex >= 0 && (
				<div className="p-3 pt-2 text-xs text-muted-foreground">
					<Separator className="mb-2" />
					<span>{`Selected: Slide ${currentIndex + 1}`}</span>
				</div>
			)}
		</aside>
	);
}
