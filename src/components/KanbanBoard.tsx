"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { APPLICATION_STAGES } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";

export interface KanbanCard {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  skills: string;
  status: ApplicationStatus;
  rating: number;
  createdAt: string;
}

interface KanbanBoardProps {
  cards: KanbanCard[];
}

export default function KanbanBoard({
  cards: initialCards,
}: KanbanBoardProps): React.ReactElement {
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function moveCard(cardId: string, nextStatus: ApplicationStatus): void {
    const current = cards.find((c) => c.id === cardId);
    if (!current || current.status === nextStatus) return;

    const previousStatus = current.status;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: nextStatus } : c))
    );
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || "Failed to update stage");
        }
        router.refresh();
      } catch (err) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, status: previousStatus } : c
          )
        );
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {APPLICATION_STAGES.map((stage) => {
          const stageCards = cards.filter((c) => c.status === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={() => {
                if (draggingId) {
                  moveCard(draggingId, stage.id);
                  setDraggingId(null);
                }
              }}
              className={`rounded-lg border ${stage.color} p-2 min-h-[300px] flex flex-col`}
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold text-blue-900">
                  {stage.label}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-blue-900 border border-blue-200">
                  {stageCards.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {stageCards.length === 0 ? (
                  <p className="text-xs text-blue-700 text-center py-4">
                    Drop a card here
                  </p>
                ) : (
                  stageCards.map((card) => (
                    <article
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggingId(card.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className="bg-white border border-blue-200 rounded-md p-3 shadow-sm cursor-move hover:border-blue-400"
                    >
                      <Link
                        href={`/company/talent/${card.applicantId}`}
                        className="block"
                      >
                        <p className="text-sm font-semibold text-blue-950 truncate">
                          {card.applicantName}
                        </p>
                        <p className="text-xs text-blue-700 truncate">
                          {card.applicantEmail}
                        </p>
                        {card.skills && (
                          <p className="text-xs text-blue-600 mt-1 truncate">
                            {card.skills}
                          </p>
                        )}
                      </Link>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {APPLICATION_STAGES.filter(
                          (s) => s.id !== card.status
                        ).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            disabled={isPending}
                            onClick={() => moveCard(card.id, s.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                            title={`Move to ${s.label}`}
                          >
                            → {s.label}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-blue-700 mt-3">
        Drag cards between columns, or use the arrow buttons to move them.
      </p>
    </div>
  );
}
