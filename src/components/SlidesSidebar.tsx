import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import type { TLPageId } from "tldraw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
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
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";
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
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div
					className={cn(
						"flex items-center gap-2",
						isCollapsed ? "flex-col justify-center" : "justify-between",
					)}
				>
					<h2
						className={cn(
							"text-sm font-semibold tracking-tight",
							isCollapsed && "sr-only",
						)}
					>
						Slides
					</h2>
					<Button
						size={isCollapsed ? "icon-sm" : "sm"}
						onClick={onAdd}
						aria-label="Add slide"
						title="Add slide"
					>
						<Plus className="size-4" />
						<span className={cn(isCollapsed && "sr-only")}>Add</span>
					</Button>
				</div>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{slides.map((slide, index) => {
							const isActive = slide.id === currentSlideId;
							const isEditing = slide.id === editingId;

							if (isCollapsed) {
								return (
									<SidebarMenuItem key={slide.id} className="flex justify-center">
										<Button
											variant={isActive ? "default" : "outline"}
											size="icon-sm"
											onClick={() => onSelect(slide.id)}
											aria-label={`Go to slide ${index + 1}`}
											title={slide.title}
											className={cn(
												"size-8 rounded-md text-xs font-semibold",
												isActive &&
													"ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
											)}
										>
											{index + 1}
										</Button>
									</SidebarMenuItem>
								);
							}

							return (
								<SidebarMenuItem key={slide.id} className="rounded-md border bg-card p-2">
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
											<SidebarMenuButton
												isActive={isActive}
												tooltip={slide.title}
												onClick={() => onSelect(slide.id)}
												onDoubleClick={() => startEditing(slide)}
											>
												<span>{slide.title}</span>
											</SidebarMenuButton>
										)}
									</div>

									<div className="mt-2 flex flex-wrap gap-1 group-data-[collapsible=icon]:hidden">
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
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				{currentIndex >= 0 && (
					<div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
						<span>{`Selected: Slide ${currentIndex + 1}`}</span>
					</div>
				)}
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
