import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState, type ReactNode } from "react";
import { DndBoardColumn } from "./DndBoardColumn";
import type { StatusColor } from "../status-colors";

export interface DndBoardGroup<T> {
  key: string;
  label: string;
  color: StatusColor;
  items: T[];
}

export interface DndBoardViewProps<T extends { id: string }> {
  groups: DndBoardGroup<T>[];
  renderCard: (item: T, isDragOverlay?: boolean) => ReactNode;
  onAdd?: (groupKey: string) => void;
  onMoveItem: (itemId: string, fromGroup: string, toGroup: string) => void;
  testId?: string;
}

/**
 * Board ที่รองรับ Drag & Drop ข้าม column
 *
 * เมื่อลากการ์ดจาก column หนึ่งไปยังอีก column หนึ่ง จะเรียก onMoveItem
 * เพื่อให้ parent component จัดการอัปเดตข้อมูล (เช่น เปลี่ยน role ของ Task)
 */
export function DndBoardView<T extends { id: string }>({
  groups,
  renderCard,
  onAdd,
  onMoveItem,
  testId,
}: DndBoardViewProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Find which group an item belongs to
  function findGroupForItem(itemId: string): string | undefined {
    for (const group of groups) {
      if (group.items.some((item) => item.id === itemId)) {
        return group.key;
      }
    }
    return undefined;
  }

  // Find the active item for DragOverlay
  function getActiveItem(): T | undefined {
    if (activeId === null) return undefined;
    for (const group of groups) {
      const item = group.items.find((i) => i.id === activeId);
      if (item) return item;
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    const fromGroup = findGroupForItem(activeItemId);
    if (!fromGroup) return;

    // ตรวจว่า over เป็น column (droppable) หรือเป็น item อื่น
    let toGroup: string | undefined;

    // ถ้า over id ตรงกับ group key = ลากลง column ว่าง
    if (groups.some((g) => g.key === overId)) {
      toGroup = overId;
    } else {
      // over เป็น item อื่น → หา group ของ item นั้น
      toGroup = findGroupForItem(overId);
    }

    if (!toGroup) return;

    // ถ้าย้ายไปคนละ group → trigger move
    if (fromGroup !== toGroup) {
      onMoveItem(activeItemId, fromGroup, toGroup);
    }
  }

  const activeItem = getActiveItem();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:overflow-x-auto pb-5" data-testid={testId}>
        {groups.map((group) => (
          <DndBoardColumn
            key={group.key}
            id={group.key}
            label={group.label}
            color={group.color}
            count={group.items.length}
            itemIds={group.items.map((item) => item.id)}
            onAdd={onAdd ? () => onAdd(group.key) : undefined}
            testId={testId ? `${testId}-${group.key}` : undefined}
          >
            {group.items.map((item) => renderCard(item))}
          </DndBoardColumn>
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="shadow-floating rounded opacity-90">
            {renderCard(activeItem, true)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
