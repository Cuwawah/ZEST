"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTags, createTag, deleteTag } from "@/app/actions/tags";

const TAG_COLORS = [
  "#f5c518", "#e67e22", "#16a34a", "#2563eb",
  "#7c3aed", "#db2777", "#0f766e", "#b91c1c",
];

interface TagManagerProps {
  assignedTagIds?: Set<string>;
  onAssign?: (tagId: string) => void;
  onRemove?: (tagId: string) => void;
}

export default function TagManager({ assignedTagIds, onAssign, onRemove }: TagManagerProps) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags(),
  });

  const createMut = useMutation({
    mutationFn: () => createTag(newTagName, newTagColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTagName("");
      setShowCreate(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (tagId: string) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });

  const available = assignedTagIds
    ? (tags || []).filter((t) => !assignedTagIds.has(t.id))
    : tags || [];

  return (
    <div className="tag-manager">
      {showCreate ? (
        <div className="create-form">
          <input
            className="input tag-name-input"
            placeholder="Tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            autoFocus
          />
          <div className="color-row">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                className={`color-dot ${newTagColor === c ? "color-active" : ""}`}
                style={{ background: c }}
                onClick={() => setNewTagColor(c)}
              />
            ))}
          </div>
          <div className="create-actions">
            <button
              className="btn-save"
              onClick={() => createMut.mutate()}
              disabled={!newTagName.trim() || createMut.isPending}
            >
              {createMut.isPending ? "Creating..." : "Create"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => { setShowCreate(false); setNewTagName(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="tag-list">
          {available.map((tag) => (
            <div key={tag.id} className="tag-item">
              <button
                className="tag-select"
                onClick={() => onAssign?.(tag.id)}
              >
                <span className="tag-dot" style={{ background: tag.color }} />
                {tag.name}
              </button>
              <button
                className="tag-delete"
                onClick={() => {
                  if (confirm(`Delete tag "${tag.name}"?`)) {
                    deleteMut.mutate(tag.id);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button className="btn-create-tag" onClick={() => setShowCreate(true)}>
            + New tag
          </button>
        </div>
      )}

      <style jsx>{`
        .tag-manager {
          display: inline-block;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          align-items: center;
        }

        .tag-item {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .tag-select {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 3px 8px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--foreground);
          background: none;
          border: none;
          cursor: pointer;
        }

        .tag-select:hover {
          background: #f5f3e8;
        }

        .tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tag-delete {
          padding: 3px 6px;
          font-size: 0.875rem;
          color: var(--muted);
          background: none;
          border: none;
          border-left: 1px solid var(--border);
          cursor: pointer;
          line-height: 1;
        }

        .tag-delete:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        .btn-create-tag {
          padding: 3px 8px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted);
          background: none;
          border: 1px dashed var(--border);
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .btn-create-tag:hover {
          border-color: var(--foreground);
          color: var(--foreground);
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .tag-name-input {
          font-size: 0.8125rem;
          padding: 0.375rem 0.5rem;
        }

        .color-row {
          display: flex;
          gap: 0.375rem;
        }

        .color-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .color-dot:hover {
          transform: scale(1.15);
        }

        .color-active {
          border-color: var(--foreground);
          box-shadow: 0 0 0 2px white;
        }

        .create-actions {
          display: flex;
          gap: 0.375rem;
        }

        .btn-save {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1a1a0f;
          background: #f5c518;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted);
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
